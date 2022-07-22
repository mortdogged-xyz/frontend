import React, {useState, useEffect} from 'react';

import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

import { LoadingModal } from './Loading';

import { DataGrid, GridColumnHeaderParams, GridColDef } from '@mui/x-data-grid';

import {
    NavBar,
    IconIcon,
    IconExport,
    IconKind,
    IconSentiment,
    champColor,
    allTabs,
    tabFilters,
    SentimentColors,
    StarSummaryChip,
    ExtraSummaryChip,
} from './Balance';
import { exportURL } from './config';

function capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

interface Summary {
    icon: IconExport
    numbers: Record<string, number>,
}

interface Stats {
    submissions: number,
    items: number,
}

interface SummaryResponse {
    summary: Array<Summary>,
    stats: Stats,
};

const RenderIcon = (props: {icon: IconExport, width?: string}) => {
    const { icon, width } = props;
    const iconWidth = "70px";

    let borderStyle = {};

    if (icon.kind === "champ") {
        const shadowRadius = '5px';

        borderStyle = {
            borderColor: champColor(icon.icon),
            borderStyle: 'solid',
            borderWidth: '1px',
            boxShadow: `0 0 ${shadowRadius} ${champColor(icon.icon)}`,
        }
    }
    
    return (
        <IconIcon
        icon={icon}
        width={width || iconWidth}
        onClick={() => console.log("nothing")}
        style={{ ...borderStyle,
                 cursor: 'pointer',
                 marginLeft: '15px',
                 marginBottom: '15px' }}
        />
    )
}

const RenderSummary = (props: {summary: Array<Summary>, pile: IconKind}) => {
    const { summary, pile } = props;

    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.up('md'));

    const nameColumn = {
        field: 'name',
        headerName: 'Name',
        width: 130,
        sortable: true,
        renderCell: (params: any) => {
            return params.row.icon.icon;
        }
    };

    let iconWidth = "70px";
    let iconColWidth = 130;
    let rowHeight = pile === "champ" ? 200 : 100;
    let numberColWidth = 90;

    if (!matches) {
        iconWidth = "40px";
        iconColWidth = 80;
        rowHeight = pile === "champ" ? 165 : 80;
        numberColWidth = 80;
    }

    const columns: GridColDef[]  = [
        {
            field: 'icon',
            headerName: 'Icon',
            width: iconColWidth,
            sortable: false,
            renderCell: (params: any) => {
                return <RenderIcon icon={params.row.icon as IconExport} width={iconWidth} />
            }
        },
        { field: 'total',  headerName: 'Total', width: 50, type: 'number' },
    ];

    
    const sentiments: Array<IconSentiment> = ['buff', 'nerf'];
    sentiments.forEach((sentiment) => {
        const key = `${sentiment}Total`;

        columns.push({
            field: key,
            width: numberColWidth * 2,
            type: 'number',
            renderCell: (p) => {
                const params = p.row as Record<string, number>;
                const icon = p.row.icon as IconExport;

                const stars = [...Array(3)].map((_, i) => {
                    const star = i + 1;

                    return (
                        <Box component="div" sx={{
                            justifyContent: 'space-evenly',
                            flexGrow: 1,
                            display: 'flex',
                            margin: '5px',
                        }}>
                            <Box component="span">
                                {params[`${key}${star}`] || 0} <StarSummaryChip starLevel={star} />
                            </Box>
                            <Box component="span">
                                {params[`${sentiment}Super${star}`] || 0} <ExtraSummaryChip pile={sentiment} />
                            </Box>
                        </Box>
                    )
                })

                return (
                    <Box component="div" flexDirection="column" sx={{ width: '100%' }}>
                        <Box component="div" textAlign="center">
                            Total: {params[key] || 0}
                        </Box>
                        <Box component="div" textAlign="center">
                            {params[`${sentiment}SuperAny`] || 0} <ExtraSummaryChip pile={sentiment} />
                        </Box>
                        {icon.kind === "champ" && stars}
                    </Box>
                )
            },
            renderHeader: (params: GridColumnHeaderParams) => (
                <Typography color={SentimentColors[sentiment]}>
                    {capitalize(sentiment)}
                </Typography>
            )
        });
    });

    if (matches) {
        columns.splice(0, 0, nameColumn);
    }

    const rows = summary.map((sum) => {
        const { icon, numbers } = sum;

        return {
            ...numbers,
            id: `${icon.icon}|${icon.kind}`,
            icon,
        }
    });

    return (
        <div style={{ height: '92vh', width: '100%' }}>
            <DataGrid
                rowHeight={rowHeight}
                rows={rows}
                columns={columns}
                pageSize={100}
                rowsPerPageOptions={[100]}
                checkboxSelection
            />
        </div>
    )
}

export const Dashboard = (props: {uid: string | null, logout: () => void}) => {
    const [currentTab, setCurrentTab] = useState(allTabs[0]);
    const { uid, logout } = props;
    const [state, setState] = useState<SummaryResponse>({summary: [], stats: {submissions: 0, items: 0}})
    const [loading, setLoading] = useState(true);
    const [searchFilter, setSearchFilter] = useState("");


    const tabFilter: IconKind = tabFilters[currentTab] || 'champ';
    const filteredState = state.summary.filter((item) => {
        return item.icon.icon.toLowerCase().includes(searchFilter.toLowerCase()) &&
               item.icon.kind === tabFilter;
    })

    useEffect(() => {
        let active = true;

        const dataUrl = `${exportURL}${uid}`;

        const f = async () => {
            if (!active || state.summary.length > 0) { return }

            console.log("Fetching data");
            const resp = await fetch(dataUrl);
            const data = await resp.json() as SummaryResponse;
            console.log(`${data.stats.submissions} users submitted ${data.stats.items} individual entries`);
            setState(data);
            setLoading(false);
        }

        f().catch(console.error);

        return () => { active = false };
    }, [uid, state.summary.length])

    return (
        <>
            <LoadingModal loading={loading} />
            <NavBar
                setTab={setCurrentTab}
                currentTab={currentTab}
                canSubmit={false}
                showSubmit={false}
                submit={() => {}}
                logout={logout}
                onSearch={setSearchFilter}
            />
            <RenderSummary summary={filteredState} pile={tabFilter} />
        </>
    )
}

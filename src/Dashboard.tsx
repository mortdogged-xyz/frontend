import React, {useState, useEffect} from 'react';

import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

import { DataGrid } from '@mui/x-data-grid';

import { NavBar, IconIcon, IconExport, champColor, allTabs, tabFilters } from './Balance';
import { TFTSet, TFTVersion } from './version';

function capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

/* const url = `https://us-central1-tft-meta-73571.cloudfunctions.net/exportResponsesV2?TFTSet=${TFTSet}&TFTVersion=${TFTVersion}&token=`; */
const url = `http://localhost:5001/tft-meta-73571/us-central1/exportResponsesV2?TFTSet=${TFTSet}&TFTVersion=${TFTVersion}&token=`;

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

const RenderSummary = (props: {summary: Array<Summary>}) => {
    const { summary } = props;

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
    let rowHeight = 100;
    let numberColWidth = 70;

    if (!matches) {
        iconWidth = "40px";
        iconColWidth = 80;
        rowHeight = 75;
        numberColWidth = 60;
    }

    const columns = [
        {
            field: 'icon',
            headerName: 'Icon',
            width: iconColWidth,
            sortable: false,
            renderCell: (params: any) => {
                return <RenderIcon icon={params.row.icon as IconExport} width={iconWidth} />
            }
        },
        { field: 'total',      headerName: 'Total', width: numberColWidth, type: 'number' },
        { field: 'buffTotal',  headerName: 'Buff',  width: numberColWidth, type: 'number' },
        { field: 'nerfTotal',  headerName: 'Nerf',  width: numberColWidth, type: 'number' },
    ];

    
    ['buff', 'nerf'].forEach((sentiment) => {
        const key = `${sentiment}Total`;
        columns.push({ field: key, headerName: capitalize(key), width: numberColWidth, type: 'number' });

        [...Array(3)].forEach((_, i) => {
            const star = i+1;
            const subkey = `${key}${star}`;
            columns.push({ field: subkey,  headerName: capitalize(subkey), width: numberColWidth, type: 'number' });
        })
    });

    if (matches) {
        columns.splice(0, 0, nameColumn);
    }

    const rows = summary.map((sum) => {
        const { icon, numbers } = sum;
        console.log(numbers);

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

export const LoadingModal = (props: {loading: boolean}) => {
    const { loading } = props;

    const style = {
        position: 'absolute' as 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
    };

    return (
        <Modal
            open={loading}
            onClose={() => {}}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box component="div" sx={style}>
                <CircularProgress />
            </Box>
        </Modal>
    )
}

export const Dashboard = (props: {uid: string | null}) => {
    const [currentTab, setCurrentTab] = useState(allTabs[0]);
    const { uid } = props;
    const [state, setState] = useState<SummaryResponse>({summary: [], stats: {submissions: 0, items: 0}})
    const [loading, setLoading] = useState(true);
    const [searchFilter, setSearchFilter] = useState("");


    const tabFilter = tabFilters[currentTab] || 'champ';
    const filteredState = state.summary.filter((item) => {
        return item.icon.icon.toLowerCase().includes(searchFilter.toLowerCase()) &&
               item.icon.kind === tabFilter;
    })

    useEffect(() => {
        let active = true;

        const dataUrl = `${url}${uid}`;

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
                onSearch={setSearchFilter}
            />
            <RenderSummary summary={filteredState} />
        </>
    )
}

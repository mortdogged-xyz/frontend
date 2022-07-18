import React, {useState, useEffect} from 'react';

import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';

import { DataGrid } from '@mui/x-data-grid';

import { NavBar, IconIcon, IconData, iconWidth, champColor, allTabs, tabFilters } from './Balance';
import { TFTSet, TFTVersion } from './version';

const url = `https://us-central1-tft-meta-73571.cloudfunctions.net/exportResponses?TFTSet=${TFTSet}&TFTVersion=${TFTVersion}&token=`;

interface Summary {
    icon: IconData
    buff: number,
    nerf: number,
}

type SummaryState = Array<Summary>;

const RenderIcon = (props: {icon: IconData}) => {
    const { icon } = props;
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
        width={iconWidth}
        onClick={() => console.log("nothing")}
        style={{ ...borderStyle,
                 cursor: 'pointer',
                 marginLeft: '15px',
                 marginBottom: '15px' }}
        />
    )
}

const RenderSummary = (props: {summary: SummaryState}) => {
    const { summary } = props;
    const columns = [
        {
            field: 'icon',
            headerName: '',
            width: 130,
            renderCell: (params: any) => {
                return <RenderIcon icon={params.row.icon as IconData} />
            }
        },
        { field: 'buff', headerName: 'Buff', width: 70 },
        { field: 'nerf', headerName: 'Nerf', width: 70 },
        { field: 'total', headerName: 'Total', width: 70 },
    ];

    const rows = summary.map((sum) => {
        const { icon, nerf, buff } = sum;

        return {
            total: nerf + buff,
            id: `${icon.icon}|${icon.kind}`,
            icon, nerf, buff,
        }
    });

    return (
        <div style={{ height: '92vh', width: '100%' }}>
            <DataGrid
                rowHeight={130}
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
    const [state, setState] = useState<SummaryState>([])
    const [loading, setLoading] = useState(true);
    const [searchFilter, setSearchFilter] = useState("");


    const tabFilter = tabFilters[currentTab] || 'champ';
    const filteredState = state.filter((item) => {
        return item.icon.icon.toLowerCase().includes(searchFilter.toLowerCase()) &&
               item.icon.kind === tabFilter;
    })

    useEffect(() => {
        const dataUrl = `${url}${uid}`;

        const f = async () => {
            console.log("Fetching data");
            const resp = await fetch(dataUrl);
            const data = await resp.json() as SummaryState;
            setState(data);
            setLoading(false);
        }

        if (state.length === 0) {
            f().catch((e) => {
                setLoading(false);
                console.error(e);
            });
        } else {
            setLoading(false);
        }
    }, [state, uid])

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

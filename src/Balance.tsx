import React, {useState} from 'react';
import { useDrag, useDrop } from 'react-dnd';

import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Tooltip from '@mui/material/Tooltip';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

import TFTData from './data.json';

const TFTSet = "7";

interface ItemData {
    icon: string;
    kind: string;
}

function iconURL(item: ItemData): string {
    if (item.kind === "champ") {
        return `https://rerollcdn.com/characters/Skin/${TFTSet}/${item.icon}.png`
    }

    return "";
}

const DraggableIcon = (props: {item: ItemData}) => {
    const { item } = props;

    const [{ isDragging }, drag] = useDrag(() => ({
        type: "item",
        item: item,
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging()
        })
    }));

    return (
        <Tooltip title={item.icon}>
            <Button variant={isDragging ? "outlined" : "contained"} ref={drag} disabled={false}>
                <img width="80px" src={iconURL(item)} alt={item.icon} />
            </Button>
        </Tooltip>
    )
    
}

const DroppableZone = (props: {border: "right" | "left" | "none", onDrop: (item: ItemData) => void, children: JSX.Element|JSX.Element[]}) => {
    const { onDrop, children, border } = props;

    const [{ isOver }, drop] = useDrop(
        () => ({
            accept: "item",
            drop: (item, monitor) => {
                onDrop(item as ItemData);
            },
            collect: (monitor) => ({
                isOver: !!monitor.isOver()
            })
        }),
        []
    )
    
    const zoneStyle = {
        opacity: isOver ? "10%" : "100%",
        width: '100%',
        height: '100vh',
    };

    return (
        <Box component="div" ref={drop} style={zoneStyle} sx={{borderRight: border === "right" ? 1 : 0, borderLeft: border === "left" ? 1 : 0}}>
            {children}
        </Box>
    );
    
}

const items = TFTData.champs.map((icon) => {
    return {icon: icon, kind: "champ"};
});

interface BalanceData {
    nerf: Array<ItemData>;
    noop: Array<ItemData>;
    buff: Array<ItemData>;
}


const RenderItems = (props: {items: Array<ItemData>}) => {
    const itemsRendered = props.items.map((item) => <DraggableIcon item={item} key={item.icon}/>);

    return (
        <>
            {itemsRendered}
        </>
    )
}


function append<T>(arr: Array<T>, el: T): Array<T> {
    return arr.concat([el]);
}

function disj<T>(arr: Array<T>, el: T): Array<T> {
    return arr.filter((e) => e !== el);
}

type BalanceKey = "nerf" | "noop" | "buff";
const allKeys = ["nerf", "noop", "buff"] as BalanceKey[];

function moveFromTo(data: BalanceData, tok: BalanceKey, el: ItemData) {
    const clone = {...data};

    allKeys.forEach((fromk) => clone[fromk] = disj(clone[fromk], el));
    clone[tok] = append(clone[tok], el);

    return clone;
}

const allTabs = ["Champions", "Items", "Traits", "Augments"];
const tabFilters = {
    "Champions": "champ",
    "Items": "item",
    "Traits": "trait",
    "Augments": "aug",
} as Record<string, string>;

function filterBalance(balance: BalanceData, k: string): BalanceData {
    const clone = {...balance};
    (Object.keys(clone) as (keyof typeof clone)[]).forEach((key: BalanceKey) => clone[key] = clone[key].filter((v) => v.kind === k));
    return clone;
}

export const Balance = () => {
    const [currentTab, setCurrentTab] = useState(allTabs[0]);
    const [allBalance, setAllBalance] = useState<BalanceData>({nerf: [], noop: items, buff: []})

    const tabFilter = tabFilters[currentTab] || 'champ';
    const balance = filterBalance(allBalance, tabFilter);

    const nerf = (item: ItemData) => setAllBalance((balance) => moveFromTo(balance, "nerf", item));
    const noop = (item: ItemData) => setAllBalance((balance) => moveFromTo(balance, "noop", item));
    const buff = (item: ItemData) => setAllBalance((balance) => moveFromTo(balance, "buff", item));

    const handleChange = (event: React.SyntheticEvent, newTab: string) => {
        setCurrentTab(newTab);
    };

    const headerSx = {fontSize: "18px", marginTop: "20px"};

    return (
        <div>
            <AppBar position="static">
                <Container maxWidth="xl">
                    <Toolbar disableGutters>
                        <Box component="div" sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                            <Tabs value={currentTab} onChange={handleChange} centered>
                                {allTabs.map((tab) => <Tab label={tab} value={tab} key={tab} />)}
                            </Tabs>
                        </Box>
                        <Button color="inherit">Submit</Button>
                    </Toolbar>
                </Container>
            </AppBar>
            <Stack
                direction="row"
                justifyContent="center"
                alignItems="center"
                spacing={2}
                sx={{ paddingTop: '5px' }}
            >
                <DroppableZone onDrop={nerf} border="right">
                    <Typography align="center" sx={headerSx}>Needs a Nerf</Typography>
                    <Stack
                        direction="row"
                        justifyContent="center"
                        alignItems="center"
                        spacing={2}
                        sx={{ paddingTop: '5px' }}
                    >
                        <RenderItems items={balance.nerf}/>
                    </Stack>
                </DroppableZone>
                <DroppableZone onDrop={noop} border="none">
                    <Typography align="center" sx={headerSx}>Keep as is</Typography>
                    <Stack
                        direction="row"
                        justifyContent="center"
                        alignItems="center"
                        spacing={2}
                        sx={{ paddingTop: '5px' }}
                    >
                        <RenderItems items={balance.noop}/>
                    </Stack>
                </DroppableZone>
                <DroppableZone onDrop={buff} border="left">
                    <Typography align="center" sx={headerSx}>Needs a Buff</Typography>
                    <Stack
                        direction="row"
                        justifyContent="center"
                        alignItems="center"
                        spacing={2}
                        sx={{ paddingTop: '5px' }}
                    >
                        <RenderItems items={balance.buff}/>
                    </Stack>
                </DroppableZone>
            </Stack>
        </div>
    )
}

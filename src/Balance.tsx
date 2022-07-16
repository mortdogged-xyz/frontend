import React, {useState} from 'react';
import { useDrag, useDrop } from 'react-dnd';

import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
/* import Stack from '@mui/material/Stack'; */
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Tooltip from '@mui/material/Tooltip';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

import TFTData from './set_data.json';

const TFTSet = "7";

interface IconData {
    icon: string;
    kind: string;
}

function iconURL(icon: IconData): string {
    if (icon.kind === "champ") {
        return `https://rerollcdn.com/characters/Skin/${TFTSet}/${icon.icon}.png`
    } else if (icon.kind === "item") {
        return `https://rerollcdn.com/items/${icon.icon}.png`
    } else if (icon.kind === "aug") {
        return `https://rerollcdn.com/augments/${TFTSet}/${icon.icon}.png`
    } else if (icon.kind === "trait") {
        return `https://rerollcdn.com/icons/${icon.icon}.png`
    }

    return "";
}

const DraggableIcon = (props: {icon: IconData}) => {
    const { icon } = props;

    const [{ isDragging }, drag] = useDrag(() => ({
        type: "icon",
        item: icon,
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging()
        })
    }));

    return (
        <Tooltip title={icon.icon}>
            <img
                ref={drag}
                width="80px"
                src={iconURL(icon)}
                alt={icon.icon}
                style={{ opacity: (isDragging ? "10%" : "100%"),
                         cursor: 'pointer',
                         marginLeft: '15px',
                         marginBottom: '15px' }}
            />
        </Tooltip>
    )
    
}

const DroppableZone = (props: {border: "right" | "left" | "none", onDrop: (icon: IconData) => void, children: JSX.Element|JSX.Element[]}) => {
    const { onDrop, children, border } = props;

    const [{ isOver }, drop] = useDrop(
        () => ({
            accept: "icon",
            drop: (icon, monitor) => {
                onDrop(icon as IconData);
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

function convertData(data: Array<string>, kind: string, blacklist: Array<string>): Array<IconData> {
    return data.filter((icon) => !blacklist.includes(icon)).map((icon) => {
        return {icon: icon, kind: kind};
    });
}

const champs = convertData(TFTData.champs, "champ", ["Nomsy"])
const items = convertData(
    TFTData.items.filter((icon) => {
        return !icon.includes("Radiant") &&
               !icon.includes("Shimmerscale") &&
               !icon.includes("Ornn") &&
               !icon.includes("EmptyBag") &&
               !icon.includes("AstralEmblem") &&
               !icon.includes("Trainer")
    }),
    "item",
    [],
)
const augs = convertData(TFTData.augs, "aug", [])
const traits = convertData(TFTData.traits, "trait", [])
const allIcons = champs.concat(items).concat(augs).concat(traits);

interface BalanceData {
    nerf: Array<IconData>;
    noop: Array<IconData>;
    buff: Array<IconData>;
}


const RenderIcons = (props: {icons: Array<IconData>}) => {
    const iconsRendered = props.icons.map((icon) => <DraggableIcon icon={icon} key={icon.icon}/>);

    return (
        <>
            {iconsRendered}
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

function moveFromTo(data: BalanceData, tok: BalanceKey, el: IconData) {
    console.log(el);
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
    const [allBalance, setAllBalance] = useState<BalanceData>({nerf: [], noop: allIcons, buff: []})

    const tabFilter = tabFilters[currentTab] || 'champ';
    const balance = filterBalance(allBalance, tabFilter);

    const nerf = (icon: IconData) => setAllBalance((balance) => moveFromTo(balance, "nerf", icon));
    const noop = (icon: IconData) => setAllBalance((balance) => moveFromTo(balance, "noop", icon));
    const buff = (icon: IconData) => setAllBalance((balance) => moveFromTo(balance, "buff", icon));

    const handleChange = (event: React.SyntheticEvent, newTab: string) => {
        setCurrentTab(newTab);
    };

    const headerSx = {fontSize: "18px", marginTop: "20px", fontWeight: "semi-bold"};

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

            <Grid
                container
                alignItems="center"
                spacing={2}
                sx={{ paddingTop: '5px' }}
            >
                <Grid item xs={4}>
                    <DroppableZone onDrop={nerf} border="right">
                        <Typography align="center" sx={headerSx} color="red">NERF</Typography>
                        <Box
                            component="div"
                            sx={{ display: 'flex',
                                  flexWrap: "wrap",
                                  paddingTop: '5px',
                                  justifyContent: 'flex-start' }}
                        >
                            <RenderIcons icons={balance.nerf}/>
                        </Box>
                    </DroppableZone>
                </Grid>

                <Grid item xs={4}>
                    <DroppableZone onDrop={noop} border="none">
                        <Typography align="center" sx={headerSx} color="primary">No change</Typography>
                        <Box
                            component="div"
                            sx={{ display: 'flex',
                                  flexWrap: "wrap",
                                  paddingTop: '5px',
                                  justifyContent: 'flex-start' }}
                        >
                            <RenderIcons icons={balance.noop}/>
                        </Box>
                    </DroppableZone>
                </Grid>

                <Grid item xs={4}>
                    <DroppableZone onDrop={buff} border="left">
                        <Typography align="center" sx={headerSx} color="blue">BUFF</Typography>
                        <Box
                            component="div"
                            sx={{ display: 'flex',
                                  flexWrap: "wrap",
                                  paddingTop: '5px',
                                  justifyContent: 'flex-start' }}
                        >
                            <RenderIcons icons={balance.buff}/>
                        </Box>
                    </DroppableZone>
                </Grid>
            </Grid>
        </div>
    )
}

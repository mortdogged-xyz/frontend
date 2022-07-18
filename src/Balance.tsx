import React, {useState, useEffect} from 'react';
import { useDrag, useDrop } from 'react-dnd';

import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
/* import Stack from '@mui/material/Stack'; */
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import MenuIcon from '@mui/icons-material/Menu';

import { Logout, dbSet, dbGet } from './firebase';
import { Info } from './info';

import TFTData from './set_data.json';

import { TFTSet, StorageKey } from './version';

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
    props,
    ref,
) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

interface IconData {
    icon: string;
    kind: string;
    starLevel?: number;
    isSuper?: boolean;
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

function champCost(icon: string): number {
    const cost = (TFTData.champ_cost as Record<string, number>)[icon];
    if (cost) {
        return cost;
    }
    return -1;
}

function champColor(icon: string): string {
    const cost = champCost(icon);

    if (cost === 6 || cost === 5) {
        return "gold";
    } if (cost === 4 || cost === 3) {
        return "purple";
    } if (cost === 2 ) {
        return "blue";
    } if (cost === 1 ) {
        return "green";
    }

    return "gray";
}

const DraggableIcon = (props: {
    icon: IconData,
    currentlyActive: IconData | null,
    onClick: (icon: IconData) => void,
}) => {
    const { icon, currentlyActive, onClick } = props;

    const [{ isDragging }, drag] = useDrag(() => ({
        type: "icon",
        item: icon,
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging()
        })
    }));

    let borderStyle = {};

    if (icon.kind === "champ") {
        /* const shadowRadius = icon.isSuper === true ? '25px' : '5px'; */
        const shadowRadius = icon === currentlyActive ? '55px' : '5px';

        borderStyle = {
            borderColor: champColor(icon.icon),
            borderStyle: 'solid',
            borderWidth: '1px',
            boxShadow: `0 0 ${shadowRadius} ${champColor(icon.icon)}`,
        }
    }

    const clickHandler = () => onClick(icon);

    return (
        <Box component="div">
            <Tooltip title={icon.icon}>
                <img
                    ref={drag}
                    width="80px"
                    src={iconURL(icon)}
                    alt={icon.icon}
                    onClick={clickHandler}
                    style={{ ...borderStyle,
                            opacity: (isDragging ? "10%" : "100%"),
                            cursor: 'pointer',
                            marginLeft: '15px',
                            marginBottom: '15px' }}
                />
            </Tooltip>
        </Box>
    )
    
}

type ColumnBorder = "right" | "left" | "none";

const DroppableZone = (props: {
    bgColor: string,
    border: ColumnBorder,
    onDrop: (icon: IconData) => void,
    children: JSX.Element|JSX.Element[],
}) => {
    const { onDrop, children, border, bgColor } = props;

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
        backgroundColor: isOver ? bgColor : "",
        /* borderStyle: 'solid',
         * borderWidth: '1px',
         * borderColor: 'red', */
        width: '95%',
        height: '98%',
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

TFTData.champs.sort((a, b) => champCost(a) - champCost(b));
const champs = convertData(TFTData.champs.reverse(), "champ", ["Nomsy"])
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


const RenderIcons = (props: {
    icons: Array<IconData>,
    currentlyActive: IconData | null,
    onClick: (icon: IconData) => void,
}) => {
    const { icons, currentlyActive, onClick } = props;
    const iconsRendered = icons.map((icon) =>
        <DraggableIcon
            icon={icon}
            currentlyActive={currentlyActive}
            onClick={onClick}
            key={icon.icon}
        />
    );

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

const emptyBalanceState = {nerf: [], noop: [], buff: []};
const defaultBalanceState = {nerf: [], noop: allIcons, buff: []};

export const NavBar = (props: {
    setTab: (tab: string) => void,
    currentTab: string,
    canSubmit: boolean,
    submit: () => void,
}) => {
    const { setTab, currentTab, canSubmit, submit } = props;
    const [navAnchorEl, setNavAnchorEl] = useState<HTMLElement | null>(null);
    const [navMenuOpen, setNavMenuOpen] = useState(false);

    const toggleNavMenu = (e: React.MouseEvent<HTMLElement>) => {
        setNavMenuOpen((v) => !v);  
        setNavAnchorEl(e.currentTarget);
    } 

    const changeTab = (tab: string) => {
        return () => {
            setTab(tab);
            setNavMenuOpen(false);  
        }
    };

    const handleChange = (event: React.SyntheticEvent, tab: string) => {
        changeTab(tab)();
    };

   return (
            <AppBar position="static">
                <Container maxWidth="xl">
                    <Toolbar disableGutters>
                        <Box component="div" sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
                            <IconButton
                                size="large"
                                onClick={toggleNavMenu}
                            >
                                <MenuIcon />
                            </IconButton>
                            <Menu
                                keepMounted
                                open={navMenuOpen}
                                onClose={toggleNavMenu}
                                anchorEl={navAnchorEl}

                            >
                                {allTabs.map((tab) => {
                                    return (
                                        <MenuItem onClick={changeTab(tab)} key={tab} >
                                            {tab}
                                        </MenuItem>
                                    );
                                })}
                            </Menu>

                        </Box>

                        <Box component="div" sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                            <Tabs value={currentTab} onChange={handleChange} centered>
                                {allTabs.map((tab) => <Tab label={tab} value={tab} key={tab} />)}
                            </Tabs>
                        </Box>

                        <Button color="inherit" disabled={!canSubmit} onClick={submit}>Submit</Button>
                        <Button color="inherit" onClick={Logout}>Logout</Button>
                        <Info />
                    </Toolbar>
                </Container>
            </AppBar>
   )
}

export const Column = (props: {
    onDrop: (item: IconData) => void,
    sx: any,
    header: string,
    headerColor: string,
    border: ColumnBorder,
    bgColor: string,
    icons: Array<IconData>,
    currentlyActive: IconData | null,
    onClick: (icon: IconData) => void,
}) => {
    const {
        onDrop,
        sx,
        header,
        headerColor,
        border,
        bgColor,
        icons,
        currentlyActive,
        onClick,
    } = props;

    return (
        <Grid item xs={4}>
            <DroppableZone onDrop={onDrop} border={border} bgColor={bgColor}>
                <Typography align="center" sx={sx} color={headerColor}>{header}</Typography>
                <Box
                    component="div"
                    sx={{ display: 'flex',
                          flexWrap: "wrap",
                          paddingTop: '5px',
                          justifyContent: 'flex-start' }}
                >
                    <RenderIcons
                        icons={icons}
                        currentlyActive={currentlyActive}
                        onClick={onClick}
                    />
                </Box>
            </DroppableZone>
        </Grid>
    )
}

export const Balance = (props: {uid: string | null}) => {
    const { uid } = props;
    const [currentTab, setCurrentTab] = useState(allTabs[0]);
    const [loadedBalance, setLoadedBalance] = useState(false);
    const [allBalance, setAllBalance] = useState<BalanceData>(emptyBalanceState);
    const [alertShown, setAlertShown] = useState(false);
    const [currentlyActiveIcon, setCurrentlyActiveIcon] = useState<IconData | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await dbGet<BalanceData>(StorageKey, uid || "anon");
                if (!loadedBalance) {
                    setAllBalance(data || defaultBalanceState);
                }
            } catch (e) {
                console.log(e);
                console.log("Did not find user data, initailizing default data")
                setAllBalance(defaultBalanceState);
            }
            setLoadedBalance(true);
        }

        loadData().catch(console.error);
    }, [uid, loadedBalance])
    
    const submit = async () => {
        await dbSet(StorageKey, uid || "anon", allBalance);
        setAlertShown(true);
    }

    const closeAlert = () => setAlertShown(false);

    const tabFilter = tabFilters[currentTab] || 'champ';
    const balance = filterBalance(allBalance, tabFilter);

    const nerf = (icon: IconData) => {
        setCurrentlyActiveIcon(icon);
        setAllBalance((balance) => moveFromTo(balance, "nerf", icon));
    }
    const noop = (icon: IconData) => {
        setCurrentlyActiveIcon(icon);
        setAllBalance((balance) => moveFromTo(balance, "noop", icon));
    }
    const buff = (icon: IconData) => {
        setCurrentlyActiveIcon(icon);
        setAllBalance((balance) => moveFromTo(balance, "buff", icon));
    }

    const clickIcon = (icon: IconData) => {
        if (currentlyActiveIcon === icon) {
            setCurrentlyActiveIcon(null);
        } else {
            setCurrentlyActiveIcon(icon);
        }
    }

    const headerSx = {
        fontSize: '18px',
        marginTop: '20px',
        marginBottom: '20px',
        fontWeight: 'semi-bold',
    };

    return (
        <>
            <NavBar
                setTab={setCurrentTab}
                currentTab={currentTab}
                canSubmit={allBalance.nerf.length > 0 || allBalance.buff.length > 0}
                submit={submit}
            />

            <Snackbar open={alertShown}
                      anchorOrigin={{vertical: "top", horizontal: "center"}}
                      autoHideDuration={6000}
                      onClose={closeAlert}>
                <Alert severity="success" onClose={closeAlert}>Submitted, Thanks!</Alert>
            </Snackbar>

            <Grid
                container
                alignItems="top"
                spacing={2}
                sx={{ paddingTop: '5px', height: '100%' }}
            >

                <Column
                    onDrop={nerf}
                    border="right"
                    bgColor="red"
                    header="NERF"
                    headerColor="red"
                    sx={headerSx}
                    icons={balance.nerf}
                    currentlyActive={currentlyActiveIcon}
                    onClick={clickIcon}
                />

                <Column
                    onDrop={noop}
                    border="none"
                    bgColor="gray"
                    header="No change"
                    headerColor="primary"
                    sx={headerSx}
                    icons={balance.noop}
                    currentlyActive={currentlyActiveIcon}
                    onClick={clickIcon}
                />

                <Column
                    onDrop={buff}
                    border="left"
                    bgColor="#24ff7d"
                    header="BUFF"
                    headerColor="#24ff7d"
                    sx={headerSx}
                    icons={balance.buff}
                    currentlyActive={currentlyActiveIcon}
                    onClick={clickIcon}
                />
            </Grid>
        </>
    )
}

import React, {useState, useEffect} from 'react';
import { useDrag, useDrop } from 'react-dnd';

import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
/* import Stack from '@mui/material/Stack'; */
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Snackbar from '@mui/material/Snackbar';

import MenuIcon from '@mui/icons-material/Menu';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';

import { dbSet, dbGet } from './firebase';
import { InfoMenu } from './Info';
import { Search } from './Search';
import { showStarsNSuper } from './feature_flags'
import { Alert } from './Alert';

import TFTData from './set_data.json';

import { TFTSet, StorageKey } from './version';

export const iconWidth = "80px";


export type IconKind = "champ" | "item" | "trait" | "aug";
export type IconSentiment = "nerf" | "buff" | "noop";

export interface IconExport {
    icon: string;
    kind: IconKind;
}

export interface IconData {
    icon: string;
    kind: IconKind;
    sentiment: IconSentiment;
    starLevel: number;
    isSuper: boolean;
}

export type BalanceData = Record<IconKind, Record<string, IconData>>;
export type BalanceDataForRendering = Record<IconSentiment, Array<IconData>>

export const SentimentColors = {
    nerf: "red",
    noop: "gray",
    buff: "#24ff7d",
} as Record<IconSentiment, string>;

const SentimentChipColor = {
    nerf: "error",
    noop: "primary",
    buff: "success",
} as Record<IconSentiment, "primary" | "success" | "error" >;

const StarLevelChipColor = {
    1: "primary",
    2: "info",
    3: "warning",
} as Record<number, "primary" | "info" | "warning" >;

function iconURL(icon: IconExport): string {
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

export function champColor(icon: string): string {
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

export const IconIcon = (props: {
    icon: IconExport,
    width: string,
    onClick: () => void,
    style: any,
}) => {
    const {
        icon,
        width,
        onClick,
        style
    } = props;

    return (
        <Box component="div">
            <img
                width={width}
                src={iconURL(icon)}
                alt={icon.icon}
                onClick={onClick}
                style={style}
            />
        </Box>
    )
}

const DynamicStar = (props: {filled: boolean, onClick: () => void}) => {
    const { filled, onClick } = props;

    return filled ? <StarIcon onClick={onClick} /> : <StarBorderIcon onClick={onClick} />;
}

const ThreeStars = (props: {
    starLevel: number,
    selectStar: (star: number) => void,
}) => {
    const { starLevel, selectStar } = props;

    const stars = [...Array(3)].map((_, i) => 
        <DynamicStar
            filled={i < starLevel}
            onClick={() => selectStar(i+1)}
            key={`filled-icon-${i}`} />
    )

    return (<> {stars} </>)
}

const StarSelector = (props: {
    starLevel: number,
    selectStar: (star: number) => void,
}) => {
    const { starLevel, selectStar } = props;

    function clickHandle(i: number) {
        if (i === starLevel) {
            selectStar(0);
        } else {
            selectStar(i);
        }
    }

    return (
        <Typography>
            <ThreeStars starLevel={starLevel} selectStar={clickHandle} />
        </Typography>
    )
}

const ExtraChip = (props: {
    pile: IconSentiment,
    isSuper: boolean,
    onClick?: () => void,
}) => {
    const {
        pile,
        /* isSuper, */
        onClick,
    } = props;

    return (
        <Chip
            component="span"
            color={SentimentChipColor[pile]}
            label={`${pile.toUpperCase()}+`}
            onClick={onClick}
        />
    )
}

export const StarSummaryChip = (props: {
    starLevel: number,
    onClick?: () => void,
}) => {
    const {
        starLevel,
        onClick,
    } = props;

    return (
        <Chip
            color={StarLevelChipColor[starLevel]}
            variant="filled"
            component="span"
            size="small"
            onClick={onClick}
            label={starLevel}
            icon={<StarIcon />}
        />
    )
}

const DraggableIcon = (props: {
    icon: IconData,
    currentlyActive: IconData | null,
    pile: IconSentiment,
    selectStar: (star: number) => void,
    setIsSuper: (isSuper: boolean) => void,
    onClick: (icon: IconData) => void,
}) => {
    const {
        icon,
        currentlyActive,
        pile,
        selectStar,
        setIsSuper,
        onClick,
    } = props;

    const [{ isDragging }, drag] = useDrag(() => ({
        type: "icon",
        item: icon,
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging()
        })
    }));

    let borderStyle = {};

    const isActive = icon === currentlyActive;

    if (icon.kind === "champ") {
        const shadowRadius = icon.isSuper === true ? '25px' : '5px';

        borderStyle = {
            borderColor: champColor(icon.icon),
            borderStyle: 'solid',
            borderWidth: '1px',
            boxShadow: `0 0 ${shadowRadius} ${champColor(icon.icon)}`,
        }
    }

    const clickHandler = () => onClick(icon);

    const dropdownVisible = isActive && showStarsNSuper;

    return (
        <Box component="div"
            sx={{position: 'relative'}}
        >
            <Box ref={drag}>
                <IconIcon
                    icon={icon}
                    width={iconWidth}
                    onClick={clickHandler}
                    style={{ ...borderStyle,
                            opacity: (isDragging ? "10%" : "100%"),
                            cursor: 'pointer',
                            marginLeft: '15px',
                            marginBottom: '15px' }}
                />

                {(icon.starLevel > 0 || icon.isSuper) &&
                <Box
                    component="div"
                    onClick={clickHandler}
                    sx={{
                        position: 'absolute',
                        bottom: 25,
                        left: 20,
                        width: '78px',
                    }}
                >
                    <Typography display="flex">
                    {icon.starLevel > 0  &&
                        <Box
                            component="span"
                            sx={{ flexGrow: 1 }}
                        >
                            <StarSummaryChip
                                starLevel={icon.starLevel}
                                onClick={clickHandler}
                            />
                        </Box>
                    }
                    {icon.isSuper && pile !== "noop" &&
                        <Box
                            component="span"
                            sx={{ flexGrow: 1 }}
                        >
                            <Chip
                                color={SentimentChipColor[pile]}
                                component="span"
                                size="small"
                                onClick={clickHandler}
                                label="+"
                            />
                        </Box>
                    }
                    </Typography>
                 </Box>
                }
            </Box>

            {dropdownVisible &&
             <Card
                 component="div"
                 sx={{
                     ...borderStyle,
                     width: '110px',
                     position: 'absolute',
                     top: '90px',
                     left: '0',
                     zIndex: 999,
                 }}
             >
                 <CardActionArea>
                     <CardContent>
                         <Typography>
                             {icon.icon}
                         </Typography>

                         {icon.kind === "champ" &&
                          <StarSelector starLevel={icon.starLevel} selectStar={selectStar} />}

                         <Typography>
                             {pile !== "noop" && 
                              <ExtraChip
                                  pile={pile}
                                  isSuper={icon.isSuper}
                                  onClick={() => setIsSuper(!icon.isSuper)}
                              />}
                         </Typography>
                     </CardContent>
                 </CardActionArea>
             </Card>}
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
        width: '95%',
        height: '98%',
    };

    return (
        <Box component="div" ref={drop} style={zoneStyle} sx={{borderRight: border === "right" ? 1 : 0, borderLeft: border === "left" ? 1 : 0}}>
            {children}
        </Box>
    );
    
}

function convertData(data: Array<string>, kind: string, blacklist: Array<string>): Record<string, IconData> {
    const result: Record<string, IconData> = {};

    data.filter((icon) => !blacklist.includes(icon)).forEach((icon) => 
        result[icon] = {icon: icon, kind: kind, sentiment: "noop", starLevel: 0, isSuper: false} as IconData
    );

    return result;
}

TFTData.champs.sort((a, b) => champCost(a) - champCost(b));
TFTData.augs.sort();
TFTData.items.sort((a, b) => a.includes("Emblem") ? 1 : -1);

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
const allIcons = {
    champ: champs,
    item: items,
    trait: traits,
    aug: augs,
};


const RenderIcons = (props: {
    icons: Array<IconData>,
    currentlyActive: IconData | null,
    pile: IconSentiment,
    selectStar: (icon: IconData, star: number) => void,
    setIsSuper: (icon: IconData, isSuper: boolean) => void,
    onClick: (icon: IconData) => void,
}) => {
    const {
        icons,
        currentlyActive,
        pile,
        selectStar,
        setIsSuper,
        onClick,
    } = props;

    const iconsRendered = icons.map((icon) =>
        <DraggableIcon
            icon={icon}
            currentlyActive={currentlyActive}
            pile={pile}
            selectStar={(star: number) => selectStar(icon, star)}
            setIsSuper={(isSuper: boolean) => setIsSuper(icon, isSuper)}
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

function moveFromTo(data: BalanceData, tok: IconSentiment, el: IconData) {
    const clone = {...data};

    el.sentiment = tok;
    clone[el.kind][el.icon] = el;

    return clone;
}

export const allTabs = ["Champions", "Items", "Traits", "Augments"];
export const tabFilters = {
    "Champions": "champ",
    "Items": "item",
    "Traits": "trait",
    "Augments": "aug",
} as Record<string, IconKind>;

function prepareBalanceData(balance: BalanceData, k: IconKind, search: string): BalanceDataForRendering {
    const result: BalanceDataForRendering = {"nerf": [], "noop": [], "buff": []};

    const items = Object.values(balance[k]);

    items.forEach((item) => result[item.sentiment].push(item));

    return result;
}

const emptyBalanceState: BalanceData = {champ: {}, item: {}, trait: {}, aug: {}};
const defaultBalanceState: BalanceData = allIcons;

export const NavBar = (props: {
    setTab: (tab: string) => void,
    currentTab: string,
    canSubmit: boolean,
    showSubmit: boolean,
    submit: () => void,
    onSearch: (value: string) => void,
}) => {
    const {
        setTab,
        currentTab,
        canSubmit,
        showSubmit,
        submit,
        onSearch,
    } = props;
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

                        <Search placeholder={"Search..."} onChange={onSearch}/>

                        {
                            showSubmit &&
                            <Button color="inherit" disabled={!canSubmit} onClick={submit}>Submit</Button>
                        }
                        <InfoMenu />
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
    pile: IconSentiment,
    selectStar: (icon: IconData, star: number) => void,
    setIsSuper: (icon: IconData, isSuper: boolean) => void,
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
        pile,
        selectStar,
        setIsSuper,
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
                        pile={pile}
                        selectStar={selectStar}
                        setIsSuper={setIsSuper}
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
    const [searchFilter, setSearchFilter] = useState("");

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
    
    const canSubmit = Object.values(allBalance).find((o) => Object.values(o).find((i) => i.sentiment !== "noop")) !== undefined;
    const submit = async () => {
        await dbSet(StorageKey, uid || "anon", allBalance);
        setAlertShown(true);
    }

    const closeAlert = () => setAlertShown(false);

    const tabFilter = tabFilters[currentTab] || 'champ';
    const balance = prepareBalanceData(allBalance, tabFilter, searchFilter);

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

    const selectStar = (icon: IconData, star: number) => {
        setAllBalance((balance) => {
            const clone = {...balance};
            clone[icon.kind][icon.icon].starLevel = star;
            return clone;
        })
    }

    const setIsSuper = (icon: IconData, isSuper: boolean) => {
        setAllBalance((balance) => {
            const clone = {...balance};
            clone[icon.kind][icon.icon].isSuper = isSuper;
            return clone;
        })
    }

    const search = (value: string) => setSearchFilter(value);

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
                canSubmit={canSubmit}
                showSubmit={true}
                submit={submit}
                onSearch={search}
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
                    bgColor={SentimentColors["nerf"]}
                    header="NERF"
                    headerColor={SentimentColors["nerf"]}
                    sx={headerSx}
                    icons={balance.nerf}
                    currentlyActive={currentlyActiveIcon}
                    pile="nerf"
                    selectStar={selectStar}
                    setIsSuper={setIsSuper}
                    onClick={clickIcon}
                />

                <Column
                    onDrop={noop}
                    border="none"
                    bgColor={SentimentColors["noop"]}
                    header="No change"
                    headerColor="primary"
                    sx={headerSx}
                    icons={balance.noop}
                    currentlyActive={currentlyActiveIcon}
                    pile="noop"
                    selectStar={selectStar}
                    setIsSuper={setIsSuper}
                    onClick={clickIcon}
                />

                <Column
                    onDrop={buff}
                    border="left"
                    bgColor={SentimentColors["buff"]}
                    header="BUFF"
                    headerColor={SentimentColors["buff"]}
                    sx={headerSx}
                    icons={balance.buff}
                    currentlyActive={currentlyActiveIcon}
                    pile="buff"
                    selectStar={selectStar}
                    setIsSuper={setIsSuper}
                    onClick={clickIcon}
                />
            </Grid>
        </>
    )
}

import React, {useState, useEffect} from 'react';
import {useQuery} from 'urql';

import ContentCopyIcon from '@mui/icons-material/ContentCopy';

import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import useMediaQuery from '@mui/material/useMediaQuery';
import {useTheme} from '@mui/material/styles';

import {LoadingModal} from './Loading';
import {exportResultsQuery, ExportResultsResponse} from './gql';
import {StorageKey} from './version';

import {DataGrid, GridColumnHeaderParams, GridColDef} from '@mui/x-data-grid';

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
import {exportURL} from './config';

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

interface Summary {
  icon: IconExport;
  numbers: Record<string, number>;
}

interface Stats {
  submissions: number;
  items: number;
}

interface SummaryResponse {
  summary: Array<Summary>;
  stats: Stats;
}

const RenderIcon = (props: {icon: IconExport; width?: string}) => {
  const {icon, width} = props;
  const iconWidth = '70px';

  let borderStyle = {};

  if (icon.kind === 'champ') {
    const shadowRadius = '5px';

    borderStyle = {
      borderColor: champColor(icon.icon),
      borderStyle: 'solid',
      borderWidth: '1px',
      boxShadow: `0 0 ${shadowRadius} ${champColor(icon.icon)}`,
    };
  }

  return (
    <IconIcon
      icon={icon}
      width={width || iconWidth}
      onClick={() => console.log('nothing')}
      style={{
        ...borderStyle,
        cursor: 'pointer',
        marginLeft: '15px',
        marginBottom: '15px',
      }}
    />
  );
};

const RenderSummary = (props: {summary: Array<Summary>; pile: IconKind}) => {
  const {summary, pile} = props;

  const theme = useTheme();
  const matchesMd = useMediaQuery(theme.breakpoints.up('md'));

  const nameColumn = {
    field: 'name',
    headerName: 'Name',
    width: 130,
    sortable: true,
    // eslint-disable-next-line
    renderCell: (params: any) => {
      return params.row.icon.icon;
    },
  };

  let iconWidth = '70px';
  let iconColWidth = 130;
  let rowHeight = pile === 'champ' ? 200 : 100;
  let numberColWidth = 90;

  if (!matchesMd) {
    iconWidth = '40px';
    iconColWidth = 80;
    rowHeight = pile === 'champ' ? 165 : 80;
    numberColWidth = 80;
  }

  const columns: GridColDef[] = [
    {
      field: 'icon',
      headerName: 'Icon',
      width: iconColWidth,
      sortable: false,
      // eslint-disable-next-line
      renderCell: (params: any) => {
        return (
          <RenderIcon icon={params.row.icon as IconExport} width={iconWidth} />
        );
      },
    },
    {field: 'total', headerName: 'Total', width: 80, type: 'number'},
  ];

  const sentiments: Array<IconSentiment> = ['buff', 'nerf'];
  sentiments.forEach((sentiment) => {
    const key = `${sentiment}Total`;

    columns.push({
      field: key,
      width: numberColWidth * 2,
      type: 'number',
      renderCell: (p) => {
        const labelStyles = {
          minWidth: 42,
          marginRight: 0.5,
          textAlign: 'right',
          display: 'inline-block',
        };
        const params = p.row as Record<string, number>;
        const icon = p.row.icon as IconExport;

        const stars = [...Array(3)].map((_, i) => {
          const star = i + 1;

          return (
            <Box
              component="div"
              sx={{
                justifyContent: 'space-evenly',
                flexGrow: 1,
                display: 'flex',
                margin: '5px',
              }}
            >
              <Box component="span">
                <Box component="span" sx={labelStyles}>
                  {params[`${key}${star}`] || 0}{' '}
                </Box>
                <StarSummaryChip starLevel={star} />
              </Box>
              <Box component="span">
                <Box component="span" sx={labelStyles}>
                  {params[`${sentiment}Super${star}`] || 0}{' '}
                </Box>
                <ExtraSummaryChip pile={sentiment} />
              </Box>
            </Box>
          );
        });

        return (
          <Box component="div" flexDirection="column" sx={{width: '100%'}}>
            <Box component="div" textAlign="center">
              Total:{' '}
              <Typography component="span" color={SentimentColors[sentiment]}>
                {params[key] || 0}
              </Typography>
            </Box>
            <Box component="div" textAlign="center">
              <Box component="span" sx={labelStyles}>
                {params[`${sentiment}SuperAny`] || 0}{' '}
              </Box>
              <ExtraSummaryChip pile={sentiment} />
            </Box>
            {icon.kind === 'champ' && stars}
          </Box>
        );
      },
      // eslint-disable-next-line
      renderHeader: (params: GridColumnHeaderParams) => (
        <Typography color={SentimentColors[sentiment]}>
          {capitalize(sentiment)}
        </Typography>
      ),
    });
  });

  if (matchesMd) {
    columns.splice(0, 0, nameColumn);
  }

  const rows = summary.map((sum) => {
    const {icon, numbers} = sum;

    return {
      ...numbers,
      id: `${icon.icon}|${icon.kind}`,
      icon,
    };
  });

  return (
    <div style={{height: '92vh', width: '100%'}}>
      <DataGrid
        rowHeight={rowHeight}
        rows={rows}
        columns={columns}
        pageSize={100}
        rowsPerPageOptions={[100]}
        checkboxSelection
      />
    </div>
  );
};

const CopyDataChip = (props: {data: any}) => {
  const {data} = props;
  const share = async () => {
    if (data) {
      navigator.clipboard.writeText(JSON.stringify(data));
    }
  };

  const label = 'Copy data';

  return (
    <Chip
      sx={{
        position: 'fixed',
        right: 180,
        bottom: {md: 5, sm: 10, xs: 20},
      }}
      onClick={share}
      color="success"
      variant="outlined"
      icon={<ContentCopyIcon />}
      label={label}
    />
  );
};

export const Dashboard = (props: {uid: string | null; logout: () => void}) => {
  const [currentTab, setCurrentTab] = useState(allTabs[0]);
  const {uid, logout} = props;
  const defaultState = {
    summary: [],
    stats: {submissions: 0, items: 0},
  };

  const [exportResults] = useQuery({
    query: exportResultsQuery,
    variables: {
      storageKey: StorageKey,
    },
  });
  const loading = exportResults.fetching;
  const exportResponse = exportResults.data as ExportResultsResponse;
  const state = loading
    ? defaultState
    : exportResponse.exportResults
    ? (JSON.parse(exportResponse.exportResults) as SummaryResponse)
    : defaultState;

  if (exportResults.error) {
    console.error(exportResults.error);
  }

  const [searchFilter, setSearchFilter] = useState('');
  const tabFilter: IconKind = tabFilters[currentTab] || 'champ';
  const filteredState = state.summary.filter((item) => {
    return (
      item.icon.icon.toLowerCase().includes(searchFilter.toLowerCase()) &&
      item.icon.kind === tabFilter
    );
  });

  return (
    <>
      <LoadingModal loading={loading} />
      <NavBar
        setTab={setCurrentTab}
        currentTab={currentTab}
        canSubmit={false}
        showSubmit={false}
        // eslint-disable-next-line
        submit={() => {}}
        logout={logout}
        onSearch={setSearchFilter}
      />
      <RenderSummary summary={filteredState} pile={tabFilter} />
      <CopyDataChip data={state} />
    </>
  );
};

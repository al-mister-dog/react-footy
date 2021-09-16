import * as React from "react";
import { useState, useEffect } from "react";
import PropTypes from "prop-types";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";

import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";

import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";

import FilterListIcon from "@mui/icons-material/FilterList";

import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles({
  root: {
    width: "70%",
    margin: "auto",
  },
  container: {
    maxHeight: 440,
  },
  cellRow: {
    minWidth: "10px",
    maxWidth: "100px",
    "&:hover": {
      background: "#2B3D6B",
      color: "white",
      cursor: "pointer",
    },
  },
  cellColumn: {
    minWidth: "10px",
    maxWidth: "100px",
    "&:hover": {
      background: "#E44C69",
      color: "white",
      cursor: "pointer",
    },
  },
});

const EnhancedTableToolbar = (props) => {
  return (
    <Toolbar>
      <Typography
        sx={{ flex: "1 1 100%" }}
        variant="h6"
        id="tableTitle"
        component="div"
      >
        All Players
      </Typography>

      <Tooltip title="Filter list">
        <IconButton>
          <FilterListIcon />
        </IconButton>
      </Tooltip>
    </Toolbar>
  );
};

EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
};

export default function StickyHeadTable() {
  const classes = useStyles();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tableData, setTableData] = useState([{}]);
  const [fields, setFields] = useState(Object.keys(tableData[0]));
  const [selectedArr, setSelectedArr] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState([]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const onFilter = (val, i) => {
    if (fields[i] === "name") {
      return;
    }
    setFilterValues(val, i);
    setStyles(i);
  };

  const setStyles = (i) => {
    setSelectedIdx(i);
  };

  const setFilterValues = (val, i) => {
    let selected;
    selectedArr.length > 0
      ? setSelectedArr([...selectedArr, selected])
      : (selected = [{ field: fields[i], value: val }]);
    filterCell(selected);
  };
  const filterCell = async (selected) => {
    const response = await fetch("http://localhost:4000/api/filter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        selected: selected,
        id: "",
      }),
    });
    const data = await response.json();
    setTableData(data);
    setFields(Object.keys(data[0]));
  };

  const getData = async () => {
    const response = await fetch("http://localhost:4000/api/get-data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: "",
      }),
    });
    const data = await response.json();
    setTableData(data);
    setFields(Object.keys(data[0]));
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <Paper className={classes.root}>
      <EnhancedTableToolbar />
      <TableContainer className={classes.container}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {fields.map((field, i) => {
                return (
                  <TableCell key={i} className={[classes.cellColumn]}>
                    {field}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {tableData
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((obj, i) => {
                let arr = Object.values(obj);
                return (
                  <TableRow key={i}>
                    {arr.map((val, i) => {
                      const notSelected = {};
                      const selected = {
                        color: "white",
                        background: "#2B3D6B",
                      };
                      return (
                        <TableCell
                          key={i}
                          className={classes.cellRow}
                          style={selectedIdx === i ? selected : notSelected}
                          onClick={() => onFilter(val, i)}
                        >
                          {val}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={tableData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}

import * as React from "react";
import { useState, useEffect } from "react";

import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from '@mui/material/IconButton';
import RefreshIcon from '@mui/icons-material/Refresh';
import Switch from "@mui/material/Switch";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";

import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles({
  root: {
    width: "70%",
    margin: "auto",
  },
  container: {
    maxHeight: 440,
  },
  cell: {
    minWidth: "10px",
    maxWidth: "100px",
  },
  cellRow: {
    "&:hover": {
      background: "rgba(43, 61, 107, 0.1)",
      cursor: "pointer",
    },
  },
  cellColumn: {
    "&:hover": {
      background: "rgb(252, 240, 242)",
      cursor: "pointer",
    },
  },
});

export default function StickyHeadTable() {
  const classes = useStyles();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [tableData, setTableData] = useState([{}]);
  const [fields, setFields] = useState(Object.keys(tableData[0]));
  const [fieldValuePairs, setFieldValuePairs] = useState([]);

  const [sortedIndex, setSortedIndex] = useState(null);
  const [currentSelectedIndex, setCurrentSelectedIndex] = useState(null);
  const [customFunc, setCustomFunc] = useState("");

  const [direction, setDirection] = useState(false);

  const [filteredIndexes, setFilteredIndexes] = useState([]);
  const [selectedIndexes, setSelectedIndexes] = useState([]);

  const [tableIsFiltered, setTableIsFiltered] = useState(false);

  const reset = () => {
    setFieldValuePairs([]);
    setSortedIndex(null);
    setCurrentSelectedIndex(null);
    setCustomFunc("");
    setDirection(false);
    setFilteredIndexes([]);
    setSelectedIndexes([]);
    setTableIsFiltered(false);
    getData()
  }

  const resetExceptFilterToggle = () => {
    setFieldValuePairs([]);
    setSortedIndex(null);
    setCurrentSelectedIndex(null);
    setCustomFunc("");
    setDirection(false);
    setFilteredIndexes([]);
    setSelectedIndexes([]);
    getData()
  }

  //PAGINATION
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  //STYLES AND CLASSES
  const setCellsToStyle = (i, selectedCustomFunc) => {
    setCustomFunc(selectedCustomFunc);
    setCurrentSelectedIndex(i);
    filterManyChecked
      ? setSelectedIndexes((selectedIndexes) => {
       let newSelectedIndexes = [...selectedIndexes, i];
       return newSelectedIndexes; 
      })
      : setSelectedIndexes((selectedIndexes) => {
        let newSelectedIndexes = [i];
        return newSelectedIndexes;
      });
  };

  const returnCellStyle = (i) => {
    if (filteredIndexes.includes(i)) {
      return {
        background: "rgba(43, 61, 107, 0.2)",
      };
    } else if (sortedIndex === i) {
      return {
        background: "rgba(228, 76, 104, 0.2)",
      };
    }
  };

  // FILTER AND SORT
  const onClickColumnCell = (val, i) => {
    setCellsToStyle(i, "sorted");
    setDirection(!direction);
    sendFieldsToSort(val);
  };

  const onClickRowCell = (val, i) => {
    setTableIsFiltered(true);
    setCellsToStyle(i, "filtered");
    setFilterValues(val, i);
  };

  const sendFieldsToSort = (selectedField) => {
    if (tableIsFiltered) {
      sortFilteredResults(selectedField);
    } else {
      sortByField(selectedField);
    }
  };

  const setFilterValues = (val, i) => {
    let fieldValuePair = { field: fields[i], value: val };
    if (filterManyChecked) {
      setFieldValuePairs([...fieldValuePairs, fieldValuePair]);
    } else {
      setFieldValuePairs([fieldValuePair]);
    }
    filter([fieldValuePair]);
  };

  //API REQUESTS
  const sortByField = async (selectedField) => {
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        field: selectedField,
        direction: direction,
        id: "",
      }),
    };
    const response = await fetch("http://localhost:4000/api/sort", options);
    const data = await response.json();
    setTableData(data);
    setFields(Object.keys(data[0]));
  };
  const sortFilteredResults = async (selectedField) => {
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        direction: direction,
        id: "",
        selected: fieldValuePairs,
        fieldToOrderBy: selectedField,
      }),
    };
    const response = await fetch(
      "http://localhost:4000/api/sort-filtered",
      options
    );
    const data = await response.json();
    setTableData(data);
    setFields(Object.keys(data[0]));
  };
  const filter = async (selected) => {
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ selected: selected, id: "" }),
    };
    const response = await fetch("http://localhost:4000/api/filter", options);
    const data = await response.json();
    setTableData(data);
    setFields(Object.keys(data[0]));
  };
  const getData = async () => {
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "" }),
    };
    const response = await fetch("http://localhost:4000/api/get-data", options);
    const data = await response.json();
    setTableData(data);
    setFields(Object.keys(data[0]));
  };

  useEffect(() => {
    fieldValuePairs.length > 0 ? filter(fieldValuePairs) : getData();
  }, [fieldValuePairs]);

  useEffect(() => {
    function setStyles() {
      if (customFunc === "filtered") {
        setFilteredIndexes(selectedIndexes);
        setSortedIndex(null);
      }
      if (customFunc === "sorted") {
        setSortedIndex(currentSelectedIndex);
      }
    }
    setStyles();
  }, [customFunc, currentSelectedIndex, selectedIndexes]);
  
  //SWITCH
  const [value, setValue] = useState(false);
  const [filterManyChecked, setFilterManyChecked] = useState(false);
  const handleChange = () => {
    setValue(!value);
    setFilterManyChecked(!filterManyChecked);
    reset()
  };

  return (
    <Paper className={classes.root}>
      <Toolbar>
        <Typography
          sx={{ flex: "1 1 100%" }}
          variant="h6"
          id="tableTitle"
          component="div"
        >
          All Players
        </Typography>
        <IconButton onClick={resetExceptFilterToggle} style={{"margin-right": "20px"}}><RefreshIcon /></IconButton>  
        <FormControlLabel
          control={<Switch checked={value} onChange={handleChange} />}
          label={
            <Typography variant="body2" color="textSecondary">
              Filter Many
            </Typography>
          }
        />
      </Toolbar>
      <TableContainer className={classes.container}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {fields.map((field, i) => {
                return (
                  <TableCell
                    key={i}
                    className={`${classes.cell} ${classes.cellColumn}`}
                    onClick={() => onClickColumnCell(field, i)}
                  >
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
                      return (
                        <TableCell
                          key={i}
                          className={`${classes.cell} ${classes.cellRow}`}
                          style={
                            selectedIndexes.includes(i) || sortedIndex === i
                              ? returnCellStyle(i)
                              : {}
                          }
                          onClick={() =>
                            fields[i] === "name" || onClickRowCell(val, i)
                          }
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

import {
  FormControl,
  Select,
  MenuItem
} from "@mui/material";

import { useTranslation } from "react-i18next";

function LanguageSelector() {

  const { i18n } = useTranslation();

  const handleChange = (event) => {
    i18n.changeLanguage(event.target.value);
  };

  return (
    <FormControl
      size="small"
      sx={{
        minWidth: 130,
        backgroundColor: "white",
        borderRadius: 1
      }}
    >
      <Select
        value={i18n.language}
        onChange={handleChange}
      >
        <MenuItem value="en">English</MenuItem>
        <MenuItem value="hi">हिन्दी</MenuItem>
        <MenuItem value="gu">ગુજરાતી</MenuItem>
      </Select>
    </FormControl>
  );
}

export default LanguageSelector;
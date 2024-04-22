import { createContext } from "react";

var core = {
  askingPassword: {
    requirePasswordToOpen: "This document requires a password to open",
    submit: "Submit",
  },
  wrongPassword: {
    tryAgain: "The password is wrong. Please try again",
  },
  pageLabel: "Page {{pageIndex}}",
};
var enUs = {
  core: core,
};

var DefaultLocalization = enUs;
const LocalizationContext = createContext({
  l10n: DefaultLocalization,
  setL10n: function () {},
});

export default LocalizationContext;

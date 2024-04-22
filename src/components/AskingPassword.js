import { useState, useEffect, useContext } from "react";
import LocalizationContext from "../context/LocalizationContext";
import ThemeContext from "../context/ThemeContext";
import TextBox from "./TextBox";
import PrimaryButton from "./PrimaryButton";

let TextDirection;
(function (TextDirection) {
  TextDirection["RightToLeft"] = "RTL";
  TextDirection["LeftToRight"] = "LTR";
})(TextDirection || (TextDirection = {}));

let PasswordStatus;
(function (PasswordStatus) {
  PasswordStatus["RequiredPassword"] = "RequiredPassword";
  PasswordStatus["WrongPassword"] = "WrongPassword";
})(PasswordStatus || (PasswordStatus = {}));

const AskingPassword = function (props) {
  const { passwordStatus, renderProtectedView, verifyPassword, onDocumentAskPassword } = props;
  const l10n = useContext(LocalizationContext).l10n;
  const [password, setPassword] = useState("");
  const direction = useContext(ThemeContext).direction;
  const isRtl = direction === TextDirection.RightToLeft;
  const submit = function () {
    return verifyPassword(password);
  };
  const handleKeyDown = function (e) {
    if (e.key === "Enter") {
      submit();
    }
  };
  useEffect(function () {
    if (onDocumentAskPassword) {
      onDocumentAskPassword({
        verifyPassword: verifyPassword,
      });
    }
  }, []);
  if (renderProtectedView) {
    return renderProtectedView({
      passwordStatus: passwordStatus,
      verifyPassword: verifyPassword,
    });
  }
  return (
    <div className="rpv-core__asking-password-wrapper">
      <div className={`rpv-core__asking-password ${isRtl ? "rpv-core__asking-password--rtl" : ""}`}>
        <div className="rpv-core__asking-password-message">
          {passwordStatus === PasswordStatus.RequiredPassword && l10n.core.askingPassword.requirePasswordToOpen} {passwordStatus === PasswordStatus.WrongPassword && l10n.core.wrongPassword.tryAgain}
        </div>
        <div className="rpv-core__asking-password-body">
          <div className={`rpv-core__asking-password-input ${!isRtl ? "rpv-core__asking-password-input--ltr" : ""} ${isRtl ? "rpv-core__asking-password-input--rtl" : ""}`}>
            <TextBox typ="password" onChange={setPassword} onKeyDown={handleKeyDown} />
          </div>
          <PrimaryButton onClick={submit}>{l10n.core.askingPassword.submit}</PrimaryButton>
        </div>
      </div>
    </div>
  );
};

export default AskingPassword;

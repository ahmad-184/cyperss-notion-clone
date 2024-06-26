import { Lock, Share } from "lucide-react";
import { Label } from "./ui/Label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/Select";
import { WorkspaceTypes } from "@/types";
import { useTranslation } from "react-i18next";
import { getDirByLang } from "@/lib/dir";
import { useLanguage } from "@/contexts/language-context";

interface PermissionSelectBox {
  value: WorkspaceTypes["type"];
  handleChange: (e: WorkspaceTypes["type"]) => void;
}

const PermissionSelectBox: React.FC<PermissionSelectBox> = ({
  value,
  handleChange,
}) => {
  const { t } = useTranslation();
  const { lang } = useLanguage();

  return (
    <div className="w-full">
      <Label>{t("dashboard:permission")}</Label>
      <Select
        onValueChange={(e: WorkspaceTypes["type"]) => {
          handleChange(e);
        }}
        value={value}
      >
        <SelectTrigger dir={getDirByLang(lang)} className="w-full h-fit">
          <SelectValue placeholder="Select a Permission" />
        </SelectTrigger>
        <SelectContent className="max-w-[90vw]">
          <SelectGroup dir={getDirByLang(lang)}>
            <SelectItem value="private">
              <div className="flex items-center w-full gap-4 p-1">
                <div>
                  <Lock size={19} />
                </div>
                <div className="flex flex-col ltr:text-left rtl:text-right">
                  <span>{t("dashboard:private")}</span>
                  <p className="text-xs font-medium">
                    {t("dashboard:private-permission-desc")}
                  </p>
                </div>
              </div>
            </SelectItem>
            <SelectItem value="shared">
              <div className="flex text-right items-center gap-4 p-1">
                <div>
                  <Share size={19} />
                </div>
                <div className="flex flex-col ltr:text-left rtl:text-right">
                  <span className="">{t("dashboard:shared")}</span>
                  <p className="text-xs font-medium">
                    {t("dashboard:shaerd-permission-desc")}
                  </p>
                </div>
              </div>
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default PermissionSelectBox;

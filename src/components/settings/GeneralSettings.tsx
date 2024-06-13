import { SlidersHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageChanger from "@/components/LanguageChanger";

interface GeneralSettingsProps {}

const GeneralSettings: React.FC<GeneralSettingsProps> = () => {
  const { t } = useTranslation();

  return (
    <>
      <div className="w-full rounded-md z-[1] bg-white dark:bg-black/15 border">
        <div
          className="p-5 py-6 flex flex-col lg:flex-row items-stretch lg:items-start w-full gap-7
        lg:gap-[8rem] xl:gap-[12rem] 2xl:gap-[17rem]
      "
        >
          <p className="flex items-center gap-2 text-sm dark:text-gray-300">
            <span>
              <SlidersHorizontal size={20} />
            </span>
            {t("dashboard:general")}
          </p>
          <div className="flex flex-grow flex-col gap-2">
            <div className="flex justify-between items-center gap-4 w-full">
              <div>
                <p className="dark:text-gray-300 text-sm">
                  {t("dashboard:appearance")}
                </p>
                <p className="text-muted-foreground text-xs">
                  {t("dashboard:appearance-desc")}
                </p>
              </div>
              <ThemeToggle btn_variant="ghost" />
            </div>
            <div className="flex justify-between items-center gap-4 w-full">
              <div>
                <p className="dark:text-gray-300 text-sm">
                  {t("dashboard:language")}
                </p>
                {/* <p className="text-muted-foreground text-xs">
                  {t("dashboard:appearance-desc")}
                </p> */}
              </div>
              <LanguageChanger btn_variant="ghost" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GeneralSettings;

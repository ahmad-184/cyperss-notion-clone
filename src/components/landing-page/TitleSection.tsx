import React from "react";

interface TitleSectionProps {
  title: string;
  subheading?: string;
  pill: string;
}

const TitleSection: React.FC<TitleSectionProps> = ({
  title,
  subheading,
  pill,
}) => {
  return (
    <section className="flex flex-col gap-4 justify-center items-start md:items-center">
      <article className="rounded-full p-[1px] text-sm bg-gradient-to-r from-blue-500 to-purple-600">
        <div className="rounded-full px-3 py-1 dark:bg-black bg-white opacity-90">
          {pill}
        </div>
      </article>
      {subheading ? (
        <div className="flex flex-col gap-3 md:items-center text-left md:text-center">
          <h1 className="text-3xl sm:text-5xl sm:max-w-[750px] font-semibold">
            {title}
          </h1>
          <p className="dark:text-zinc-400 sm:max-w-[450px]">{subheading}</p>
        </div>
      ) : (
        <div>
          <h1 className="text-left text-4xl sm:text-center sm:text-6xl sm:max-w-[850px] font-semibold">
            {title}
          </h1>
        </div>
      )}
    </section>
  );
};

export default TitleSection;

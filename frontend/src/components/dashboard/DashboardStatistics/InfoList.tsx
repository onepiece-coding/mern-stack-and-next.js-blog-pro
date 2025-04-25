import { memo } from "react";
import InfoItem from "./InfoItem";

const InfoList = memo(
  ({ data }: { data: { key: string; value: number }[] }) => {
    return (
      <div className="rounded-lg bg-gray-200 dark:bg-gray-800">
        <h3 id="stats-list" className="sr-only">
          Key Metrics
        </h3>
        <dl
          aria-labelledby="stats-list"
          className="grid max-w-screen-xl grid-cols-2 gap-4 p-4 mx-auto text-gray-900 sm:grid-cols-3 xl:grid-cols-4 dark:text-white"
        >
          {data.map((info) => (
            <InfoItem key={info.key} info={info} />
          ))}
        </dl>
      </div>
    );
  }
);

InfoList.displayName = "InfoList";

export default InfoList;

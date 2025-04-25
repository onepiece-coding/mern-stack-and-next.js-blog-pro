const InfoItem = ({ info }: { info: { key: string; value: number } }) => {
  return (
    <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-white dark:bg-gray-900">
      <dt className="mb-2 text-3xl font-extrabold">{info.value}</dt>
      <dd className="text-gray-500 dark:text-gray-400 capitalize">
        {info.key}
      </dd>
    </div>
  );
};

export default InfoItem;

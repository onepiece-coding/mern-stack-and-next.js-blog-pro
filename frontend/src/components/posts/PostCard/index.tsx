import { TPost } from "@/types";
import { dateFormater } from "@/utils";
import { Badge, Button, Card } from "flowbite-react";
import Image from "next/image";
import Link from "next/link";

const PostItem = ({
  index,
  _id,
  title,
  image: { url },
  description,
  user: { username, id },
  category,
  createdAt,
}: TPost & { index: number }) => {
  return (
    <article className="h-full">
      <Card
        className="overflow-hidden relative"
        renderImage={() => (
          <Image
            src={url}
            alt={title}
            width={1920}
            height={1080}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={index < 2} // Only prioritize first few images
            className="object-cover"
          />
        )}
      >
        <header className="flex justify-between items-center">
          <p className="text-base font-medium text-gray-900 dark:text-white">
            <span className="text-cyan-700 dark:text-cyan-200">Author: </span>{" "}
            <Link href={`/profile/${id}`}>{username}</Link>
          </p>
          <Badge
            color="info"
            className="max-sm:absolute max-sm:top-6 max-sm:right-6"
            aria-label={`Category: ${category}`}
          >
            {category}
          </Badge>
          <time
            dateTime={createdAt}
            className="text-sm text-gray-500 dark:text-gray-400"
          >
            {dateFormater(createdAt)}
          </time>
        </header>
        <h2
          className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white line-clamp-2"
          title={title}
        >
          {title}
        </h2>
        <p className="font-normal text-gray-700 dark:text-gray-400 line-clamp-5">
          {description}
        </p>
        <Button
          as={Link}
          href={`/posts/${_id}`}
          aria-label={`Read more about ${title}`}
        >
          Read More About This Post
        </Button>
      </Card>
    </article>
  );
};

export default PostItem;

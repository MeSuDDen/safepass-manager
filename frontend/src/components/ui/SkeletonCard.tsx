import { Typography } from "@material-tailwind/react";

export default function SkeletonDemo() {
    return (
        <div className="max-w-full animate-pulse flex justify-center items-center flex-col min-h-[178] py-10">
            <Typography
                as="div"
                className="mb-4 h-3 w-56 rounded-full bg-zinc-300"
            >
                &nbsp;
            </Typography>
            <Typography
                as="div"
                className="mb-2 h-2 w-72 rounded-full bg-zinc-300"
            >
                &nbsp;
            </Typography>
            <Typography
                as="div"
                className="mb-2 h-2 w-72 rounded-full bg-zinc-300"
            >
                &nbsp;
            </Typography>
            <Typography
                as="div"
                className="mb-2 h-2 w-72 rounded-full bg-zinc-300"
            >
                &nbsp;
            </Typography>
            <Typography
                as="div"
                className="mb-2 h-2 w-72 rounded-full bg-zinc-300"
            >
                &nbsp;
            </Typography>
        </div>
    );
}


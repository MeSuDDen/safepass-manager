import {Typography} from "@material-tailwind/react";

export default function SkeletonPlateGrid2() {
    return (
        <div className="max-w-full animate-pulse min-h-[178] py-4">
            <div className={"flex gap-4 flex-start items-center"}>
                <Typography
                    as="div"
                    className="mb-4 h-20 w-20 rounded-lg bg-zinc-300"
                >
                    &nbsp;
                </Typography>
                <div className={"w-1/4"}>
                    <Typography
                        as="div"
                        className="mb-4 h-3  rounded-full bg-zinc-300"
                    >
                        &nbsp;
                    </Typography>
                    <Typography
                        as="div"
                        className="mb-4 h-3 w-full rounded-full bg-zinc-300"
                    >
                        &nbsp;
                    </Typography>
                    <Typography
                        as="div"
                        className="mb-4 h-3 w-full rounded-full bg-zinc-300"
                    >
                        &nbsp;
                    </Typography>
                </div>
            </div>
            <Typography
                as="div"
                className="h-[260px] w-full rounded-lg bg-zinc-300"
            >
                &nbsp;
            </Typography>
        </div>
    );
}


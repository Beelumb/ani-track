import { useQuery } from "@tanstack/react-query";
import getAnimeOngoings from "../queryOptions/getAnimeOngoiings";
import AnimeCard from "../components/AnimeCard";
import { Link } from "react-router";

export default function HomePage() {
  const { data } = useQuery(getAnimeOngoings());

  console.log(data);

  return (
    <div className="flex flex-col gap-16">
      <section className="flex flex-col gap-8">
        <div className="flex flex-col items-center m-auto gap-2">
          <h2 className="scroll-m-20 text-3xl font-bold tracking-normal first:mt-0">
           Anime tracking website
          </h2>
          <p className="text-lg mt-1 text-center">
            Track your favorite anime and stay updated with the latest episodes!
          </p>
          
        </div>

        <div className="flex items-center justify-between">
          <div className="">
            <Link to="/anime" className="text-[24px] hover:underline">
              Ongoing
            </Link>
          </div>
          <Link
            to="/anime" 
            className="inline-flex items-center justify-center w-8 h-8 border-border rounded-default transition-colors hover:bg-secondary text-gray-400 hover:text-secondary-foreground"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="1em"
              height="1em"
              viewBox="0 0 24 24"
              className="text-lg"
            >
              <path
                fill="currentColor"
                d="M16.15 13H5q-.425 0-.712-.288T4 12t.288-.712T5 11h11.15L13.3 8.15q-.3-.3-.288-.7t.288-.7q.3-.3.713-.312t.712.287L19.3 11.3q.15.15.213.325t.062.375t-.062.375t-.213.325l-4.575 4.575q-.3.3-.712.288t-.713-.313q-.275-.3-.288-.7t.288-.7z"
              ></path>
            </svg>
          </Link>
        </div>

        <div className="relative grid -my-4 py-4 gap-4 lg:gap-8 md:grid-cols-8 no-scrollbar auto-cols-[12rem] grid-cols-scroll md:gradient-mask-none -mx-4 grid-flow-col overflow-x-scroll px-4 ">
          {data?.data.map((anime) => (
            <AnimeCard key={anime.mal_id} anime={anime} />
          ))}
        </div>
      </section>
    </div>
  );
}

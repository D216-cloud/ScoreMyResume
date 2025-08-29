import { cn } from "~/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
} from "../Accordion";

const ScoreBadge = ({ score }: { score: number }) => {
  return (
    <div
      className={cn(
        "flex flex-row gap-2 items-center px-3 py-1 rounded-full font-medium transition-all duration-300",
        score > 69
          ? "bg-green-100"
          : score > 39
          ? "bg-yellow-100"
          : "bg-red-100"
      )}
    >
      <img
        src={score > 69 ? "/icons/check.svg" : "/icons/warning.svg"}
        alt="score"
        className="w-5 h-5"
      />
      <p
        className={cn(
          "text-sm font-semibold",
          score > 69
            ? "text-green-700"
            : score > 39
            ? "text-yellow-700"
            : "text-red-700"
        )}
      >
        {score}/100
      </p>
    </div>
  );
};

const CategoryHeader = ({
  title,
  categoryScore,
}: {
  title: string;
  categoryScore: number;
}) => {
  return (
    <div className="flex flex-row gap-4 items-center py-3 px-2 bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
      <p className="text-2xl font-semibold text-gray-900">{title}</p>
      <ScoreBadge score={categoryScore} />
    </div>
  );
};

const CategoryContent = ({
  tips,
}: {
  tips: { type: "good" | "improve"; tip: string; explanation: string }[];
}) => {
  return (
    <div className="flex flex-col gap-6 items-center w-full">
      <div className="bg-gray-50 w-full rounded-xl px-6 py-5 grid grid-cols-2 gap-6 shadow-inner">
        {tips.map((tip, index) => (
          <div
            className="flex flex-row gap-3 items-center p-2 bg-white rounded-lg hover:bg-gray-100 transition-all duration-300"
            key={index}
          >
            <img
              src={tip.type === "good" ? "/icons/check.svg" : "/icons/warning.svg"}
              alt="score"
              className="w-6 h-6"
            />
            <p className="text-lg text-gray-600 font-medium">{tip.tip}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-4 w-full">
        {tips.map((tip, index) => (
          <div
            key={index + tip.tip}
            className={cn(
              "flex flex-col gap-2 p-5 rounded-2xl shadow-sm transition-all duration-300",
              tip.type === "good"
                ? "bg-green-50 border border-green-200 text-green-800 hover:bg-green-100"
                : "bg-yellow-50 border border-yellow-200 text-yellow-800 hover:bg-yellow-100"
            )}
          >
            <div className="flex flex-row gap-3 items-center">
              <img
                src={tip.type === "good" ? "/icons/check.svg" : "/icons/warning.svg"}
                alt="score"
                className="w-6 h-6"
              />
              <p className="text-lg font-semibold">{tip.tip}</p>
            </div>
            <p className="text-gray-700">{tip.explanation}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const Details = ({ feedback }: { feedback: Feedback }) => {
  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-1000">
      <Accordion>
        <AccordionItem id="tone-style">
          <AccordionHeader itemId="tone-style">
            <CategoryHeader
              title="Tone & Style"
              categoryScore={feedback.toneAndStyle.score}
            />
          </AccordionHeader>
          <AccordionContent itemId="tone-style">
            <CategoryContent tips={feedback.toneAndStyle.tips} />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem id="content">
          <AccordionHeader itemId="content">
            <CategoryHeader title="Content" categoryScore={feedback.content.score} />
          </AccordionHeader>
          <AccordionContent itemId="content">
            <CategoryContent tips={feedback.content.tips} />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem id="structure">
          <AccordionHeader itemId="structure">
            <CategoryHeader
              title="Structure"
              categoryScore={feedback.structure.score}
            />
          </AccordionHeader>
          <AccordionContent itemId="structure">
            <CategoryContent tips={feedback.structure.tips} />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem id="skills">
          <AccordionHeader itemId="skills">
            <CategoryHeader title="Skills" categoryScore={feedback.skills.score} />
          </AccordionHeader>
          <AccordionContent itemId="skills">
            <CategoryContent tips={feedback.skills.tips} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default Details;

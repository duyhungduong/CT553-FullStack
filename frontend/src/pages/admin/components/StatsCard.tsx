import { Card, CardContent } from "@/components/ui/card";

type StatsCardProps = {
  icon: React.ElementType;
  label: string;
  value: string;
  bgColor: string;
  iconColor: string;
  onClick?: () => void;
};

const StatsCard = ({
  bgColor,
  icon: Icon,
  iconColor,
  label,
  value,
  onClick,
}: StatsCardProps) => {
  return (
    <Card
      className="bg-zinc-900 border border-zinc-700 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 rounded-xl overflow-hidden"
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
      onClick={onClick}
      tabIndex={0}
    >
      <CardContent className="p-6 sm:p-8">
        <div className="flex items-center gap-4">
          {/* Icon container with gradient background */}
          <div
            className={`p-4 rounded-lg shadow-md bg-gradient-to-br ${bgColor}`}
          >
            <Icon className={`w-8 h-8 ${iconColor}`} />
          </div>

          {/* Label and Value */}
          <div className="flex-1">
            <p className={`text-sm sm:text-base ${iconColor} sm:block hidden`}>{label}</p>
            <p className={`text-2xl sm:text-3xl font-bold  ${iconColor} `}>{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;

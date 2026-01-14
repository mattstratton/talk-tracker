import { formatDistanceToNow } from "date-fns";
import { UserAvatar } from "~/components/user-avatar";

interface StatusChangeActivityProps {
  activity: {
    id: number;
    oldStatus: string | null;
    newStatus: string | null;
    createdAt: Date;
    user: {
      id: string;
      name: string;
      image: string | null;
    };
  };
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "accepted":
    case "confirmed":
      return "text-green-700";
    case "rejected":
      return "text-red-700";
    case "submitted":
      return "text-blue-700";
    case "draft":
      return "text-gray-700";
    default:
      return "text-gray-700";
  }
};

export function StatusChangeActivity({ activity }: StatusChangeActivityProps) {
  if (!activity.oldStatus || !activity.newStatus) {
    return null;
  }

  return (
    <div className="flex gap-3 p-4">
      <div className="flex-shrink-0">
        <UserAvatar
          image={activity.user.image}
          name={activity.user.name}
          size="md"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-gray-900 text-sm">
          <span className="font-medium">{activity.user.name}</span> changed
          status from{" "}
          <span className={`font-medium ${getStatusColor(activity.oldStatus)}`}>
            {activity.oldStatus}
          </span>{" "}
          to{" "}
          <span className={`font-medium ${getStatusColor(activity.newStatus)}`}>
            {activity.newStatus}
          </span>
        </p>
        <p className="mt-0.5 text-gray-500 text-xs">
          {formatDistanceToNow(new Date(activity.createdAt), {
            addSuffix: true,
          })}
        </p>
      </div>
    </div>
  );
}

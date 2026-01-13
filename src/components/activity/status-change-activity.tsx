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

export function StatusChangeActivity({
  activity,
}: StatusChangeActivityProps) {
  if (!activity.oldStatus || !activity.newStatus) {
    return null;
  }

  return (
    <div className="flex gap-3 p-4">
      <div className="flex-shrink-0">
        <UserAvatar
          name={activity.user.name}
          image={activity.user.image}
          size="md"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900">
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
        <p className="mt-0.5 text-xs text-gray-500">
          {formatDistanceToNow(new Date(activity.createdAt), {
            addSuffix: true,
          })}
        </p>
      </div>
    </div>
  );
}

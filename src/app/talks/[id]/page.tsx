import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Nav } from "~/components/nav";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { auth } from "~/server/better-auth";
import { getSession } from "~/server/better-auth/server";
import { api, HydrateClient } from "~/trpc/server";

export default async function TalkDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  const { id } = await params;
  const talkId = parseInt(id);

  if (isNaN(talkId)) {
    notFound();
  }

  const [talk, proposals] = await Promise.all([
    api.talk.getById({ id: talkId }),
    api.proposal.getByTalk({ talkId }),
  ]);

  if (!talk) {
    notFound();
  }

  const acceptedCount = proposals.filter(
    (p) => p.status === "accepted" || p.status === "confirmed",
  ).length;
  const acceptanceRate =
    proposals.length > 0 ? (acceptedCount / proposals.length) * 100 : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
      case "confirmed":
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      case "submitted":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <HydrateClient>
      <main className="min-h-screen bg-gray-50">
        <div className="border-b bg-white">
          <div className="container mx-auto px-4">
            <div className="flex h-16 items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Nav />
                <h1 className="font-semibold text-gray-900 text-lg sm:text-xl">
                  Talk Tracker
                </h1>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <span className="hidden text-gray-600 text-sm sm:inline">
                  {session.user.name}
                </span>
                <form>
                  <Button
                    formAction={async () => {
                      "use server";
                      await auth.api.signOut({
                        headers: await headers(),
                      });
                      redirect("/");
                    }}
                    size="sm"
                    type="submit"
                    variant="outline"
                  >
                    Sign out
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="mb-6">
            <Link href="/talks">
              <Button size="sm" variant="ghost">
                ← Back to Talks
              </Button>
            </Link>
          </div>

          <div className="mb-6 sm:mb-8">
            <h2 className="mb-2 font-semibold text-2xl sm:text-3xl text-gray-900">
              {talk.title}
            </h2>
            <p className="text-gray-600 text-sm">by {talk.createdBy.name}</p>
          </div>

          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-gray-200">
              <CardContent className="p-4">
                <div className="text-gray-600 text-xs">Total Submissions</div>
                <div className="font-semibold text-2xl text-gray-900">
                  {proposals.length}
                </div>
              </CardContent>
            </Card>
            <Card className="border-gray-200">
              <CardContent className="p-4">
                <div className="text-gray-600 text-xs">Accepted</div>
                <div className="font-semibold text-2xl text-green-600">
                  {acceptedCount}
                </div>
              </CardContent>
            </Card>
            <Card className="border-gray-200">
              <CardContent className="p-4">
                <div className="text-gray-600 text-xs">Rejected</div>
                <div className="font-semibold text-2xl text-red-600">
                  {proposals.filter((p) => p.status === "rejected").length}
                </div>
              </CardContent>
            </Card>
            <Card className="border-gray-200">
              <CardContent className="p-4">
                <div className="text-gray-600 text-xs">Acceptance Rate</div>
                <div className="font-semibold text-2xl text-gray-900">
                  {acceptanceRate.toFixed(0)}%
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mb-8 grid gap-6 lg:grid-cols-2">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg text-gray-900">
                  Abstract
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-gray-700 text-sm">
                  {talk.abstract}
                </p>
              </CardContent>
            </Card>

            {talk.description && (
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg text-gray-900">
                    Description
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-gray-700 text-sm">
                    {talk.description}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg text-gray-900">
                Submission History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {proposals.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="mb-4 text-gray-600">
                    This talk hasn't been submitted to any events yet.
                  </p>
                  <Link href="/proposals">
                    <Button>Submit to Event</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {proposals.map((proposal) => (
                    <Link
                      key={proposal.id}
                      href={`/proposals/${proposal.id}`}
                    >
                      <div className="flex flex-col gap-2 border-b py-3 last:border-0 transition-colors hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 text-sm">
                            {proposal.event.name}
                          </h3>
                          <p className="mt-0.5 text-gray-600 text-xs">
                            {proposal.user.name} • {proposal.talkType}
                            {proposal.submissionDate &&
                              ` • Submitted ${proposal.submissionDate}`}
                          </p>
                        </div>
                        <div className="self-start sm:self-auto">
                          <span
                            className={`inline-block rounded px-2 py-1 text-xs whitespace-nowrap ${getStatusColor(proposal.status)}`}
                          >
                            {proposal.status}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </HydrateClient>
  );
}

"use client";

type AwardItem = {
  id: string;
  name: string;
  category: string;
  year: number;
  movie: string;
  actor: string;
  status: "won" | "nominated";
};

type Props = {
  title: string;
  subtitle: string;
  statusWon: string;
  statusNominated: string;
  items: AwardItem[];
};

export default function AwardList({
  title,
  subtitle,
  statusWon,
  statusNominated,
  items,
}: Props) {
  return (
    <section className="archive-panel card border-0 shadow-sm">
      <div className="card-body p-4 p-xl-5">
        <div className="mb-4">
          <p className="archive-kicker mb-2">{subtitle}</p>
          <h2 className="archive-section-title mb-0">{title}</h2>
        </div>

        <div className="table-responsive">
          <table className="table archive-table align-middle mb-0">
            <thead>
              <tr>
                <th>Award</th>
                <th>Category</th>
                <th>Year</th>
                <th>Movie</th>
                <th>Actor</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((award) => (
                <tr key={award.id} className="archive-row">
                  <td className="archive-title">{award.name}</td>
                  <td className="archive-muted">{award.category}</td>
                  <td className="archive-muted">{award.year}</td>
                  <td className="archive-muted">{award.movie}</td>
                  <td className="archive-muted">{award.actor}</td>
                  <td>
                    <span className={`badge archive-badge ${award.status === "won" ? "is-won" : "is-nominated"}`}>
                      {award.status === "won" ? statusWon : statusNominated}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

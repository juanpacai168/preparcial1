"use client";

type ActorItem = {
  id: string;
  name: string;
  nationality: string;
  birthDate: string;
  biography: string;
  movieCount: number;
  photo: string;
};

type Props = {
  title: string;
  subtitle: string;
  items: ActorItem[];
};

export default function ActorList({ title, subtitle, items }: Props) {
  return (
    <section className="archive-panel card border-0 shadow-sm">
      <div className="card-body p-4 p-xl-5">
        <div className="mb-4">
          <p className="archive-kicker mb-2">{subtitle}</p>
          <h2 className="archive-section-title mb-0">{title}</h2>
        </div>

        <div className="row g-4">
          {items.map((actor) => (
            <div key={actor.id} className="col-md-6 col-xl-4">
              <article className="archive-card h-100">
                <div className="d-flex align-items-start gap-3">
                  <img src={actor.photo} alt={actor.name} className="archive-avatar" />
                  <div className="flex-grow-1">
                    <h3 className="archive-card-title mb-1">{actor.name}</h3>
                    <p className="archive-subtitle mb-2">
                      {actor.nationality} · {actor.birthDate}
                    </p>
                    <p className="archive-body mb-3">{actor.biography}</p>
                    <p className="archive-meta mb-0">{actor.movieCount} films</p>
                  </div>
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

type MovieItem = {
  id: string;
  title: string;
  director: string;
  genre: string;
  rating: number;
  releaseDate: string;
  poster: string;
};

type Props = {
  title: string;
  subtitle: string;
  detailsLabel: string;
  items: MovieItem[];
};

export default function MovieList({ title, subtitle, detailsLabel, items }: Props) {
  return (
    <section className="archive-panel card border-0 shadow-sm">
      <div className="card-body p-4 p-xl-5">
        <div className="d-flex justify-content-between align-items-end flex-wrap gap-3 mb-4">
          <div>
            <p className="archive-kicker mb-2">{subtitle}</p>
            <h2 className="archive-section-title mb-0">{title}</h2>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table archive-table align-middle mb-0">
            <thead>
              <tr>
                <th>{detailsLabel}</th>
                <th>Genre</th>
                <th>Rating</th>
                <th>Release</th>
              </tr>
            </thead>
            <tbody>
              {items.map((movie) => (
                <tr key={movie.id} className="archive-row">
                  <td>
                    <div className="d-flex align-items-center gap-3">
                      <img
                        src={movie.poster}
                        alt={`Poster for ${movie.title}`}
                        className="archive-thumb"
                      />
                      <div>
                        <div className="archive-title">{movie.title}</div>
                        <div className="archive-subtitle">{movie.director}</div>
                      </div>
                    </div>
                  </td>
                  <td className="archive-muted">{movie.genre}</td>
                  <td>
                    <span className="archive-rating">{movie.rating.toFixed(1)}</span>
                  </td>
                  <td className="archive-muted">{movie.releaseDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

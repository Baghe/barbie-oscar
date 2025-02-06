import { retrieveLaunchParams } from '@telegram-apps/sdk-react';
import { useEffect, useState } from 'react';
import { ApiCall } from './Functions/ApiCall';
import ImgLogo from './logo.png';
import './app.css';

export default function App({ Private }) {
  const { initData: Auth, initDataRaw: AuthRaw } = Private ? {} : retrieveLaunchParams()
  const [App, setApp] = useState(null)
  const [AppTime, setAppTime] = useState(null)
  const [AppOnline, setAppOnline] = useState(false)
  const [AdminView, setAdminView] = useState(false)
  const UpdateOnline = 20

  const [VoteForm, setVoteForm] = useState({
    IdCategory: null,
    IdUser: null,
  })

  useEffect(() => {
    AppUpdate()
    const Updater = setInterval(AppUpdate, 5000)
    return () => clearInterval(Updater)
  }, [])

  useEffect(() => {
    setAppOnline(AppTime - new Date().getTime() < UpdateOnline)
  }, [AppTime])

  function AppUpdate() {
    ApiCall(AuthRaw, 'app', {}, (data) => {
      if (data.Result) {
        setApp(App => data.Data)
        setAppTime(AppTime => data.Datetime)
      }
    })
  }

  function Vote(IdCategory, IdUser) {
    ApiCall(AuthRaw, 'vote', {
      Value: {
        IdCategory: IdCategory,
        IdUser: IdUser,
      },
    }, () => {
      AppUpdate()
      setVoteForm({
        IdCategory: null,
        IdUser: null,
      })
    })
  }

  function CategoryOpen(IdCategory) {
    ApiCall(AuthRaw, 'category-open', {
      Value: {
        IdCategory: IdCategory,
      },
    }, () => {
      AppUpdate()
    })
  }

  function CategoryClear(IdCategory) {
    if (window.confirm('Eliminare tutti i voti?')) {
      ApiCall(AuthRaw, 'category-clear', {
        Value: {
          IdCategory: IdCategory,
        },
      }, () => {
        AppUpdate()
      })
    }
  }

  function CandidateToggle(IdCategory, IdUser, Hidden) {
    ApiCall(AuthRaw, 'candidate-toggle', {
      Value: {
        IdCategory: IdCategory,
        IdUser: IdUser,
        Hidden: Hidden,
      },
    }, () => {
      AppUpdate()
    })
  }

  function Acronym(Name) {
    return Name.split(' ').map((Word) => Word.slice(0, 1)).join('')
  }

  if (App && !App.User) {
    return (
      <div className="container-fluid py-2">
        <div className="text-center">
          <div className="display-2">Accesso negato</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid py-2">
      {Auth && (
        <div className="mb-3 d-flex align-items-center justify-content-end">
          {AppOnline ? (
            <span className="d-inline-block rounded-circle bg-success" style={{ width: 10, height: 10 }}></span>
          ) : (
            <span className="d-inline-block rounded-circle bg-danger" style={{ width: 10, height: 10 }}></span>
          )}
          {App && (
            <span className="ms-2 badge bg-secondary bg-opacity-25 rounded-pill">
              <div>{App.Online} online</div>
            </span>
          )}
          {1194709210 === Auth.user.id && (
            <button className="btn btn-sm btn-primary ms-2 py-0" onClick={() => setAdminView(!AdminView)}>
              {AdminView ? 'Utente' : 'Admin'}
            </button>
          )}
        </div>
      )}

      {App && (
        <>
          {/* LOGO */}
          {!App.OpenVote && (
            <div className="px-5 text-center mb-4">
              <img src={ImgLogo} alt="Logo" className="img-fluid mx-auto w-100" style={{ maxWidth: 300 }} />
            </div>
          )}

          {/* VOTAZIONE */}
          {Auth && (
            App.OpenVote && (
              (() => {
                const Category = App.Categories[App.OpenVote]
                const Votes = Object.values(Category.Candidates).reduce((Votes, Candidate) => Votes + Candidate.Votes, 0)
                const MyVote = App.Votes[Category.IdCategory] || null
                return (
                  <>
                    <div className="text-center mb-4 cherry-swash-regular lh-1">
                      <div className="display-4">#{Category.IdCategory}</div>
                      <div className="text-muted text-white fs-5">Per la categoria</div>
                      <div className="display-2 text-center fw-bold text-barbie">{Category.Name}</div>
                      {Votes < App.Voters ? (
                        <div className="text-muted small">
                          Votazione in corso
                          <span className="small ms-1">({Votes}/{App.Voters})</span>
                        </div>
                      ) : (
                        <div className="fw-bold text-success">Votazione conclusa</div>
                      )}
                    </div>

                    {MyVote ? (
                      (() => {
                        const Voted = App.Users[MyVote]
                        return (
                          <>
                            <div className="small text-center text-muted">
                              Hai votato per
                            </div>
                            <div className="bg-success rounded-5 mb-5 p-3 text-center">
                              {Voted.Image ? (
                                <img src={Voted.Image} alt="Candidate"
                                  className="rounded-circle" style={{ width: 128, height: 128 }} />
                              ) : (
                                <div className="rounded-circle mx-auto bg-light bg-opacity-75" style={{ width: 128, height: 128, lineHeight: "128px" }}>
                                  <div className="text-center text-dark fw-bold">
                                    <div className="fs-1">
                                      {Voted.Name.slice(0, 1)}
                                    </div>
                                  </div>
                                </div>
                              )}
                              <div className="fw-bold h2 mb-0">
                                {Voted.Name}
                              </div>
                            </div>
                          </>
                        )
                      })()
                    ) : (
                      <div className="mb-5">
                        <div className="d-flex flex-column gap-2">
                          {Object.values(Category.Candidates).map((Candidate) => {
                            const Clicked = VoteForm.IdCategory === Category.IdCategory && VoteForm.IdUser === Candidate.IdUser
                            const User = App.Users[Candidate.IdUser]
                            const IsMe = Candidate.IdUser === Auth.user.id
                            return (
                              <button key={Candidate.IdUser}
                                className={"p-2 d-flex align-items-center rounded-pill border-3 cursor-pointer btn " + (Clicked ? "btn-primary" : "btn-outline-primary")}
                                onClick={() => setVoteForm({
                                  IdCategory: Category.IdCategory,
                                  IdUser: Candidate.IdUser,
                                })} disabled={IsMe}>
                                {User.Image ? (
                                  <img src={User.Image} alt="Candidate"
                                    className="rounded-circle" style={{ width: 64, height: 64 }} />
                                ) : (
                                  <div className="rounded-circle" style={{ width: 64, height: 64, lineHeight: "64px", backgroundColor: "#f8f9fa" }}>
                                    <div className="text-center text-dark fw-bold">
                                      <div className="fs-1">
                                        {User.Name.slice(0, 1)}
                                      </div>
                                    </div>
                                  </div>
                                )}
                                <div className="ms-3 text-start lh-1 pe-2">
                                  <div className="fs-3 mb-0 fw-bold">
                                    {User.Name}
                                  </div>
                                  {Candidate.Note && (
                                    <div className="text-light mt-1 small">
                                      {Candidate.Note}
                                    </div>
                                  )}
                                </div>
                              </button>
                            )
                          })}
                        </div>

                        <button className="btn btn-lg btn-success rounded-pill w-100 mt-2 py-3 fs-2 fw-bold"
                          disabled={!VoteForm.IdCategory || !VoteForm.IdUser}
                          onClick={() => Vote(VoteForm.IdCategory, VoteForm.IdUser)}>
                          Vota
                        </button>
                      </div>
                    )}

                    <div className="text-center">
                      {AdminView && (
                        <button className="btn btn-sm btn-danger" onClick={() => CategoryOpen(-1)}>
                          Chiudi votazione
                        </button>
                      )}
                    </div>
                  </>
                )
              })()
            )
          )}

          {/* CATEGORIE */}
          <div className="display-2 text-center mt-5 mb-4 text-barbie cherry-swash-regular">Categorie</div>
          <div className="d-flex flex-column gap-3 pb-4">
            {Object.values(App.Categories).map((Category, i, a) => (
              <div className="card bg-secondary bg-opacity-25 rounded-4" key={Category.IdCategory}>
                <div className="card-body px-2 pb-2">
                  <div className="text-center lh-1 mb-3">
                    {App.OpenVote === Category.IdCategory && (
                      <span className="badge bg-success rounded-pill mb-2">Votazione</span>
                    )}
                    <div className="display-6 cherry-swash-regular text-white">
                      #{Category.IdCategory} {Category.Name}
                    </div>
                  </div>

                  <div className="row g-2 justify-content-center">
                    {Object.values(Category.Candidates).sort((a, b) => {
                      return AdminView ? b.Votes - a.Votes : a.IdUser - b.IdUser
                    }).map((Candidate) => {
                      const User = App.Users[Candidate.IdUser]
                      return (
                        <div key={Candidate.IdUser} className="col-sm-6 col-md-4 col-lg-2">
                          <div className={"d-flex flex-column align-items-center text-center p-2 rounded-3 bg-dark shadow h-100" + (Candidate.Hidden ? " opacity-50" : "")}>

                            {AdminView && (
                              <div className="w-100 mb-2 bg-secondary bg-opacity-25 p-2 rounded d-flex justify-content-between align-items-center">
                                <div>
                                  {Candidate.Hidden ? (
                                    <button className="btn btn-sm btn-primary" onClick={() => CandidateToggle(Category.IdCategory, Candidate.IdUser, 0)}>
                                      Abilita
                                    </button>
                                  ) : (
                                    <button className="btn btn-sm btn-primary" onClick={() => CandidateToggle(Category.IdCategory, Candidate.IdUser, 1)}>
                                      Disabilita
                                    </button>
                                  )}

                                </div>
                                <div className="text-danger text-nowrap fw-bold">
                                  {Candidate.Votes} voti
                                </div>
                              </div>
                            )}
                            <div>
                              {User.Image ? (
                                <img src={User.Image} alt="Candidate"
                                  className="rounded-circle" style={{ width: 48, height: 48 }} />
                              ) : (
                                <div className="rounded-circle" style={{ width: 48, height: 48, lineHeight: "48px", backgroundColor: "#f8f9fa" }}>
                                  <div className="text-center text-dark fw-bold">
                                    <div className="small">
                                      {Acronym(User.Name)}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="fw-bold">{User.Name}</div>
                            {Candidate.Note && <div className="small text-muted lh-1">{Candidate.Note}</div>}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {AdminView && (
                    <div className="mt-2 bg-secondary bg-opacity-25 p-2 rounded d-flex justify-content-between align-items-center">
                      <div className="flex-grow-1 d-flex gap-2">
                        <button className="btn btn-sm btn-primary" onClick={() => CategoryOpen(Category.IdCategory)}>
                          Apri votazione
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => CategoryClear(Category.IdCategory)}>
                          Cancella voti
                        </button>
                      </div>
                      <div>
                        {Object.values(Category.Candidates).reduce((Votes, Candidate) => Votes + Candidate.Votes, 0)}/{App.Voters}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
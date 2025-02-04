import { retrieveLaunchParams } from '@telegram-apps/sdk-react';
import { useEffect, useState } from 'react';
import { ApiCall } from './Functions/ApiCall';

export default function App({ Private }) {
  const { initData: Auth, initDataRaw: AuthRaw } = Private ? {} : retrieveLaunchParams()
  const [App, setApp] = useState(null)
  const [AppTime, setAppTime] = useState(null)
  const [AppOnline, setAppOnline] = useState(false)
  const [WinnerView, setWinnerView] = useState(false)
  const UpdateOnline = 20
  const USER_ADMIN = Private ? false : 1194709210 === Auth.user.id

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
        </div>
      )}

      {App && (
        <>
          {Auth && (
            App.OpenVote ? (
              (() => {
                const Category = App.Categories[App.OpenVote]
                const Votes = Object.values(Category.Candidates).reduce((Votes, Candidate) => Votes + Candidate.Votes, 0)
                const MyVote = App.Votes[Category.IdCategory] || null
                return (
                  <>
                    <div className="text-center mb-5">
                      <div className="display-4">#{Category.IdCategory}</div>
                      <div className="text-muted">Per la categoria</div>
                      <div className="h1 fw-bold">{Category.Name}</div>
                      {Votes < App.Voters ? (
                        <div className="text-muted small">
                          Votazione in corso
                          <span className="small ms-1">({Votes}/{App.Voters})</span>
                        </div>
                      ) : (
                        <div className="fw-bold text-success">Votazione conclusa</div>
                      )}
                    </div>


                    {WinnerView ? (
                      <>

                        <div className="d-flex flex-column gap-2 mb-5">
                          {Object.values(Category.Candidates).sort((a, b) => b.Votes - a.Votes).map((Candidate) => {
                            const User = App.Users[Candidate.IdUser]
                            return (
                              <div key={Candidate.IdUser} className="d-flex align-items-center rounded-pill border border-3 p-2">
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
                                <div className="lh-1 px-3 flex-grow-1">
                                  <div className="fs-3 mb-0 fw-bold">
                                    {User.Name}
                                  </div>
                                  {Candidate.Note && (
                                    <div className="text-light mt-1 small">
                                      {Candidate.Note}
                                    </div>
                                  )}
                                </div>
                                <div className="text-center pe-3 text-success lh-1">
                                  <div className="fs-2 fw-bold">{Candidate.Votes}</div>
                                  <div className="small">Voti</div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </>
                    ) : (
                      MyVote ? (
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
                      )
                    )}
                  </>
                )
              })()
            ) : (
              <div className="text-center mb-5 py-5">
                <div className="display-4">Nessuna votazione aperta</div>
                <div className="text-muted">Stay tuned</div>
              </div>
            )
          )}


          <div className="display-6 text-center mt-5">Categorie</div>
          <div className="card bg-secondary bg-opacity-25 rounded-5 overflow-hidden mt-2">
            {USER_ADMIN && (
              <div className="card-header p-3 text-center fs-5 fw-bold">
                <button className="btn btn-sm btn-danger" onClick={() => CategoryOpen(-1)}>
                  Chiudi
                </button>
                <button className="btn btn-sm btn-primary ms-2" onClick={() => setWinnerView(!WinnerView)}>
                  Winners
                </button>
              </div>
            )}
            <div className="card-body">
              {Object.values(App.Categories).map((Category, i, a) => (
                <div key={Category.IdCategory} className={"py-2" + (i < a.length - 1 ? " border-bottom" : "")}>
                  <div className="d-flex align-items-center">
                    {App.OpenVote === Category.IdCategory && (
                      <span className="badge bg-success rounded-pill me-2">Votazione</span>
                    )}
                    <span className="fs-3">#{Category.IdCategory} {Category.Name}</span>
                  </div>
                  <div className="lh-1">
                    {Object.values(Category.Candidates).sort((a, b) => {
                      return USER_ADMIN ? b.Votes - a.Votes : a.IdUser - b.IdUser
                    }).map((Candidate) => {
                      const User = App.Users[Candidate.IdUser]
                      return (
                        <div key={Candidate.IdUser} className="d-flex align-items-between">
                          {USER_ADMIN && (
                            <div className="text-end pe-2 text-danger" style={{ width: 32 }}>
                              {Candidate.Votes}
                            </div>
                          )}
                          <div className="flex-grow-1">
                            &bull; <b>{User.Name}</b>{Candidate.Note && <small className="ms-1 text-muted">({Candidate.Note})</small>}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {USER_ADMIN && (
                    <div className="mt-2 bg-secondary bg-opacity-25 p-2 rounded d-flex justify-content-between align-items-center">
                      <button className="btn btn-sm btn-danger" onClick={() => CategoryOpen(Category.IdCategory)}>
                        Apri
                      </button>
                      <div>
                        {Object.values(Category.Candidates).reduce((Votes, Candidate) => Votes + Candidate.Votes, 0)}/{App.Voters}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

    </div>
  )
}
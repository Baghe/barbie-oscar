import { retrieveLaunchParams } from '@telegram-apps/sdk-react';
import { useEffect, useState } from 'react';
import { ApiCall } from './Functions/ApiCall';

export default function App() {
  const { initData } = retrieveLaunchParams()
  const [App, setApp] = useState(null)
  const [AppTime, setAppTime] = useState(null)
  const [AppOnline, setAppOnline] = useState(false)
  const UpdateOnline = 20

  const [VoteForm, setVoteForm] = useState({
    IdCategory: null,
    IdCandidate: null,
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
    ApiCall('app', {}, (data) => {
      if (data.Result) {
        setApp(App => data.Data)
        setAppTime(AppTime => data.Datetime)
      }
    })
  }

  return (
    <div className="container-fluid py-2">
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

      {App && (
        <>
          {App.OpenVote !== null && (

            (() => {
              const Category = App.Categories[App.OpenVote]
              return (
                <>
                  <div className="text-center mb-4">
                    <div className="text-muted">Per la categoria</div>
                    <div className="h1 fw-bold">{Category.Name}</div>
                  </div>
                  <div className="card mb-2">
                    <div className="card-body">
                      <div className="d-flex flex-column gap-2">
                        {Object.values(Category.Candidates).map((Candidate) => {
                          const Clicked = VoteForm.IdCategory === Category.IdCategory && VoteForm.IdCandidate === Candidate.IdCandidate
                          return (
                            <div key={Candidate.IdCandidate}
                              className={"d-flex align-items-center rounded-pill border-2 cursor-pointer btn p-0 " + (Clicked ? "btn-primary" : "btn-outline-primary")}
                              onClick={() => setVoteForm({
                                IdCategory: Category.IdCategory,
                                IdCandidate: Candidate.IdCandidate,
                              })}>
                              <img src={"https://baghe.altervista.org/bot/barbieoscar/imgs/" + Candidate.IdCandidate + ".png?v=2"} alt="Candidate"
                                className="rounded-circle" style={{ width: 64, height: 64 }} />
                              <div className="ms-3 text-start lh-1 pe-2">
                                <div className="fs-3 mb-0 fw-bold">
                                  {App.Candidates[Candidate.IdCandidate].Name}
                                </div>
                                {Candidate.Note && (
                                  <div className="text-light mt-1 small">
                                    {Candidate.Note}
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      <pre>{JSON.stringify(VoteForm, null, 2)}</pre>
                      <pre>{JSON.stringify(Category, null, 2)}</pre>
                    </div>
                  </div>
                </>
              )
            })()
          )}
          <div className="card mb-2">
            <div className="card-body">


            </div>
          </div>
        </>
      )}

      <div className="card">
        <div className="card-body small">
          <pre>{JSON.stringify(App, null, 2)}</pre>
          <pre>{JSON.stringify(initData, null, 2)}</pre>
        </div>
      </div>
    </div>
  )
}
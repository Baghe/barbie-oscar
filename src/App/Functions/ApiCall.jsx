export function ApiCall(Auth, Action, Values, Callback) {
  fetch('https://baghe.altervista.org/bot/barbieoscar/', {
    method: 'POST',
    headers: {
      Authorization: `tma ${Auth}`
    },
    body: JSON.stringify({
      Action: Action,
      ...Values
    })
  }).then(response => response.json())
    .then(data => {
      if (data.Result) {
        Callback(data)
      } else {
        Callback({
          Result: false,
          Data: null,
          Error: data.Error || 'An error occurred'
        })
      }
    })
}
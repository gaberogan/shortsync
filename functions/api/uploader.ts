export async function onRequest() {
  const url = 'https://postman-echo.com/post'

  const headers = {
    'content-type': 'application/json;charset=UTF-8',
  }

  const response1 = await fetch(url, {
    headers,
    method: 'POST',
    body: '{ "foo": 2 }',
  })

  const response2Text = await fetch(url, {
    headers,
    method: 'POST',
    body: response1.body,
  }).then((res) => res.text())

  return new Response(response2Text, { headers })
}

export default function (data) {
  return fetch(
    '/sse-event',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: new URL(import.meta.url).searchParams.get('id'), data }),
    }
  );
};

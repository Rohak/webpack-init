export default function () {
  const element = document.createElement('h1');

  element.className = 'pure-button';
  element.innerHTML = 'Hola mundo ;)';

  element.onclick = () => {
    import('./Lazy').then((lazy) => {
      element.textContent = lazy.default;
    }).catch((err) => {
      console.error(err);
    });
  };

  return element;
}
## Clon de Animeflv

Este es un clon de la página web [Animeflv](animeflv.net/) para poder ver anime con subtitulos en español.

Si quieren colaborar con el proyecto para practicar, sean libres de hacerlo enviando un pull request.

### Resumen
* En este proyecto mi objetivo es practicar mis habilidades en el desarrollo web, en este caso con el framework Next.js.
* La página web de fondo le hace scraping a la página de Animeflv para poder obtener los datos de los animes.
* Tambien usa el scraping para poder obtener los enlaces de descarga de los videos de los animes y así poder reproduccirlos con plyr.js evitando todo tipo de anuncios y mejorar la velocidad de reproducción.
* Para evitar el tema de Cross-Origin Resource Sharing (CORS) se utiliza el mismo servidor que hace de intermediario entre el link de descarga y el cliente.
* Respecto a la estética de la pagina web, he utilizado CSS puro y un poco de Bootstrap.

### Tecnologías utilizadas
* [Next.js 13](https://nextjs.org/blog/next-13)
* [Cheerio](https://github.com/cheeriojs/cheerio)
* [Playwright](https://github.com/Microsoft/playwright)
* [Plyr](https://plyr.io/)
* [Bootstrap](https://getbootstrap.com/)

### Instalación
Clone el repositorio
```bash
git clone https://github.com/Maol-commits/Animeflv-Clone.git
```
Instale las dependencias
```bash
npm install
```
Inicie el servidor
```bash
npm run dev
```
Para iniciar el servidor en modo producción
```bash
npm run build
npm run start
```

Abre [http://localhost:3000](http://localhost:3000) con tu navegador para ver el resultado.

### Preview

![](https://github.com/Maol-commits/Animeflv-Clone/raw/main/images/mockup.png)

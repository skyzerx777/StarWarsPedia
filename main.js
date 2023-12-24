$(document).ready(function () {
  $('.form__button').click(search);
});

async function linkGenerator(category, id = null, searchParameter = null) {
  let link = `https://swapi.dev/api/${category}/`;
  if (id !== null) {
    link += id;
    return link;
  }
  if (searchParameter !== null) {
    link += `?search=${searchParameter}`;
    return link;
  }
  return link;
}

async function search(event) {
  event.preventDefault();
  $('.outputContainer').empty();
  if ($('.form__search').val() !== '') {
    const result = await $.get({
      url: await linkGenerator(
        $('.form__select').val(),
        null,
        $('.form__search').val()
      ),
    });
    renderAll(result);
  } else {
    const result = await $.get({
      url: await linkGenerator($('.form__select').val()),
    });
    renderAll(result);
  }
}

//! При использовании асинхронных функций внутри map, проблема заключается в том,
//! что map не дожидается завершения асинхронных операций, и возвращается массив промисов, а не результатов.
// function renderAll(result) {
//   let rendered = result.results.map((item) => {
//     return renderItem(item);
//   });
//   $('.outputContainer').append(rendered);
// }

async function renderAll(result) {
  let rendered = [];
  for (let item of result.results) {
    rendered.push(await renderItem(item));
  }
  $('.outputContainer').append(rendered);
}

async function renderItem(item) {
  let renderedItem = '<div class="output__item">';
  for (let key in item) {
    if (key === 'created') {
      break;
    }
    renderedItem += `${key}: ${await linkChecker(item[key])} <br>`;
  }
  return renderedItem + '</div>';
}

//? Promise.all - это метод в JavaScript, который принимает массив промисов и возвращает новый промис.
//?   Этот новый промис разрешится, когда все переданные ему промисы разрешатся,
//?   и его значение будет массивом результатов разрешенных промисов в том порядке,
//?   в котором они были переданы.
async function linkChecker(entity) {
  let result;
  if (Array.isArray(entity)) {
    result = await Promise.all(
      entity.map(async (item) => {
        return await subRequest(item);
      })
    );
  } else {
    result = await subRequest(entity);
  }
  return result;
}

function subRequest(item) {
  const regexp = /^https:\/\/swapi.dev\/api\//;
  if (regexp.test(item)) {
    return new Promise((resolve) => {
      $.get({
        url: item,
      }).done(function (result) {
        resolve(result?.name || result.title);
      });
    });
  } else {
    return item;
  }
}

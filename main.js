$(document).ready(function () {
  $('.nav__link').click(chooseCategory);
  $('.search__button').click(search);
});

async function chooseCategory(event) {
  event.preventDefault();
  $('.outputContainer').empty();
  $('.blurContainer').toggleClass('blured');
  $.get({
    url: $(this).attr('href'),
  }).done(function (result) {
    renderSearchResults(result);
    $('.blurContainer').toggleClass('blured');
  });
}

async function renderSearchResults(result) {
  let rendered = [];
  for (let item of result.results) {
    rendered.push(await renderItems(item));
  }
  $('.outputContainer').append(rendered);
  $('.found-item').click(checkFullInfo);
}

async function renderItems(item) {
  let renderedItem = `<div class="output__item"><a href="${item.url}" class="found-item">`;
  renderedItem += `${item?.name || item.title}</a></div>`;
  return renderedItem;
}

async function checkFullInfo(event) {
  event.preventDefault();
  $('.outputContainer').empty();
  $('.blurContainer').toggleClass('blured');
  $.get({
    url: $(this).attr('href'),
  }).done(async function (result) {
    let rendered = await renderFullItem(result);
    $('.outputContainer').append(rendered);
    $('.blurContainer').toggleClass('blured');
  });
}

async function renderFullItem(item) {
  let renderedItem = '<div class="output__item">';
  for (let key in item) {
    if (key === 'created') {
      break;
    }
    renderedItem += `${key}: ${await linkChecker(item[key])} <br>`;
  }
  return renderedItem + '</div>';
}

async function linkChecker(entity) {
  let result;
  if (Array.isArray(entity)) {
    result = await Promise.all(
      entity.map(async (item) => {
        return await subRequest(item);
      })
    ).catch(() =>
      console.log($('.outputContainer').append('<h2>Oops... Try again</h2>'))
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

async function search(event) {
  event.preventDefault();
  $('.outputContainer').empty();
  if ($('.search__input').val() !== '') {
    $('.blurContainer').toggleClass('blured');
    const result = await $.get({
      url: `https://swapi.dev/api/${$('.search__select').val()}/?search=${$(
        '.search__input'
      ).val()}`,
    });
    renderSearchResults(result);
    $('.blurContainer').toggleClass('blured');
  } else {
    console.log(
      $('.outputContainer').append('<h2>You must enter something</h2>')
    );
  }
}

//!==================================================================================================
// $(document).ready(function () {
//   $('.form__button').click(search);
// });

// // Generates a link with a required parameters
// async function linkGenerator(category, id = null, searchParameter = null) {
//   let link = `https://swapi.dev/api/${category}/`;
//   if (id !== null) {
//     link += id;
//     return link;
//   }
//   if (searchParameter !== null) {
//     link += `?search=${searchParameter}`;
//     return link;
//   }
//   return link;
// }

// // Search button function
// async function search(event) {
//   event.preventDefault();
//   $('.outputContainer').empty();
//   if ($('.form__search').val() !== '') {
//     const result = await $.get({
//       url: await linkGenerator(
//         $('.form__select').val(),
//         null,
//         $('.form__search').val()
//       ),
//     });
//     renderSearchResults(result);
//   } else {
//     const result = await $.get({
//       url: await linkGenerator($('.form__select').val()),
//     });
//     renderSearchResults(result);
//   }
// }

// //! При использовании асинхронных функций внутри map, проблема заключается в том,
// //! что map не дожидается завершения асинхронных операций, и возвращается массив промисов, а не результатов.
// // function renderAll(result) {
// //   let rendered = result.results.map((item) => {
// //     return renderItem(item);
// //   });
// //   $('.outputContainer').append(rendered);
// // }
// async function renderSearchResults(result) {
//   let rendered = [];
//   for (let item of result.results) {
//     rendered.push(await renderItems(item));
//   }
//   $('.outputContainer').append(rendered);
//   $('.found-item').click(checkFullInfo);
// }

// async function renderItems(item) {
//   let renderedItem = `<div class="output__item"><a href="${item.url}" class="found-item">`;
//   renderedItem += `${item?.name || item.title}</a></div>`;
//   return renderedItem;
// }

// async function checkFullInfo(event) {
//   event.preventDefault();
//   $('.outputContainer').empty();
//   $.get({
//     url: $(this).attr('href'),
//   }).done(async function (result) {
//     let rendered = await renderFullItem(result);
//     $('.outputContainer').append(rendered);
//   });
// }

// async function renderFullItem(item) {
//   let renderedItem = '<div class="output__item">';
//   for (let key in item) {
//     if (key === 'created') {
//       break;
//     }
//     renderedItem += `${key}: ${await linkChecker(item[key])} <br>`;
//   }
//   return renderedItem + '</div>';
// }

// //? Promise.all - это метод в JavaScript, который принимает массив промисов и возвращает новый промис.
// //?   Этот новый промис разрешится, когда все переданные ему промисы разрешатся,
// //?   и его значение будет массивом результатов разрешенных промисов в том порядке,
// //?   в котором они были переданы.
// async function linkChecker(entity) {
//   let result;
//   if (Array.isArray(entity)) {
//     result = await Promise.all(
//       entity.map(async (item) => {
//         return await subRequest(item);
//       })
//     );
//   } else {
//     result = await subRequest(entity);
//   }
//   return result;
// }

// function subRequest(item) {
//   const regexp = /^https:\/\/swapi.dev\/api\//;
//   if (regexp.test(item)) {
//     return new Promise((resolve) => {
//       $.get({
//         url: item,
//       }).done(function (result) {
//         resolve(result?.name || result.title);
//       });
//     });
//   } else {
//     return item;
//   }
// }

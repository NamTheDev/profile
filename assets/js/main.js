const id = "G01-dsc";
const version = "1.1.2";
const content = [
  "username",
  "displayname",
  "about"
]

fetch('/config.json')
  .then(async (response) => {
    const json = await response.json();
    for (const id of content) {
      const element = document.getElementById(id)
      element.innerHTML += json.discord[id]
      console.log(element)
    }
  })
const SI_URL = "https://api.si.edu/openaccess/api/v1.0/search?q=Political%20posters%20%2B%20object%20type%20Posters&start=0&rows=100&type=edanmdm&row_group=objects&api_key=eb4Ll7jBtQC94nWebFIVJBpTETlptZXBo7o1Qgjw";


document.addEventListener("DOMContentLoaded", async () => {

  // Fetch Smithsonian data
  const response = await fetch(SI_URL);
  const data = await response.json();

  console.log(data);

  // Get the poster records
   const posters = data.response.rows;

  console.log("Number of posters:", posters.length);

  // Create a simpler poster dataset
  const posterData = [];

  for (let i = 0; i < posters.length; i = i + 1) {

    posterData.push({
      id: posters[i].id,
      name: posters[i].content.freetext.name,
      date: posters[i].content.freetext.date,
      place: posters[i].content.freetext.place,
      topic: posters[i].content.freetext.topic,
      notes: posters[i].content.freetext.notes
    });

  }

  console.log("Poster dataset:", posterData);

});
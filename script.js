const SI_URL = "https://api.si.edu/openaccess/api/v1.0/search?q=Political%20posters%20%2B%20object%20type%20Posters&start=0&rows=100&type=edanmdm&row_group=objects&api_key=eb4Ll7jBtQC94nWebFIVJBpTETlptZXBo7o1Qgjw";


document.addEventListener("DOMContentLoaded", async () => {

  // Fetch Smithsonian data
  const response = await fetch(SI_URL);
  const data = await response.json();

  console.log(data);

  // Get the poster records
  const posters = data.response.rows;

  console.log("Number of posters:", posters.length);
  console.log("First poster:", posters[0]);

});

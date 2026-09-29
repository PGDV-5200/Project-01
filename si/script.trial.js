const SI_URL =
  "https://api.si.edu/openaccess/api/v1.0/search?q=Political%20posters%20%2B%20object%20type%20Posters%20%2B%20online%20media&start=0&rows=1000&type=edanmdm&row_group=objects&api_key=" + SI_KEY;


document.addEventListener("DOMContentLoaded", async () => {

  try {

    // GET DATA

    const response = await fetch(SI_URL);
    const data = await response.json();

    console.log("Smithsonian data:", data);

    const posters = data.response.rows;

    console.log("Number of posters:", posters.length);


    // CREATE POSTER DATA

    const posterData = [];


    for (let i = 0; i < posters.length; i = i + 1) {

      const poster = posters[i];

      let image = null;


      // GET ONLINE MEDIA

      const onlineMedia =
        poster.content?.descriptiveNonRepeating?.online_media;


      if (onlineMedia) {

        const media = onlineMedia.media;


        if (media && media.length > 0) {

          image =
            media[0]?.thumbnail ||
            media[0]?.content ||
            null;

        }

      }


      // SAVE POSTER

      posterData.push({

        id: poster.id,

        name:
          poster.content?.freetext?.name || null,

        date:
          poster.content?.freetext?.date || null,

        topic:
          poster.content?.freetext?.topic || [],

        image: image

      });

    }


    // CHECK IMAGES

    console.log(
      "Posters WITH images:",
      posterData.filter(function(d) {
        return d.image;
      }).length
    );


    console.log(
      "Posters WITHOUT images:",
      posterData.filter(function(d) {
        return !d.image;
      }).length
    );


    // TOPICS

    const themes = [

      "Political Campaigns",
      "History",
      "Presidential",
      "Civil Rights",
      "Activism",
      "Elections",
      "Politics",
      "LGBTQ Rights",
      "Labor Unions",
      "Political organizations",
      "Reform Movements",
      "Peace/Anti-War"

    ];


    // FIND POSTERS FOR EACH TOPIC

    const topicData = [];


    for (let i = 0; i < themes.length; i = i + 1) {

      const theme = themes[i];

      const matchingPosters = [];


      for (let j = 0; j < posterData.length; j = j + 1) {

        const poster = posterData[j];

        const topics = poster.topic;


        if (!topics) {
          continue;
        }


        for (let k = 0; k < topics.length; k = k + 1) {

          const topicObject = topics[k];


          if (
            topicObject &&
            topicObject.content === theme
          ) {

            matchingPosters.push(poster);

            break;

          }

        }

      }


      topicData.push({

        topic: theme,

        posters: matchingPosters,

        count: matchingPosters.length

      });

    }


    console.log("Topic data:", topicData);


    // DRAW

    drawVisualization(topicData);


  } catch (error) {

    console.error(
      "Error loading Smithsonian data:",
      error
    );

  }

});



function drawVisualization(topicData) {

  const width = 1200;

  const labelWidth = 210;

  const imageGap = 8;

  const imageWidth = 58;

  const imageHeight = 76;

  const postersStartX =
    labelWidth + 90;


  // POSTERS PER ROW

  const postersPerRow = Math.max(
    1,
    Math.floor(
      (width - postersStartX - 20) /
      (imageWidth + imageGap)
    )
  );


  // ROW HEIGHTS

  const rowHeights = topicData.map(
    function(topic) {

      const numberOfRows =
        Math.max(
          1,
          Math.ceil(
            topic.count / postersPerRow
          )
        );


      return Math.max(
        120,
        numberOfRows *
          (imageHeight + 10) +
          45
      );

    }
  );


  // TOTAL HEIGHT

  let height = 40;


  for (
    let i = 0;
    i < rowHeights.length;
    i = i + 1
  ) {

    height =
      height +
      rowHeights[i];

  }


  // SVG

  const svg = d3
    .select("#visualization")
    .append("svg")

    .attr(
      "width",
      width
    )

    .attr(
      "height",
      height
    )

    .attr(
      "viewBox",
      `0 0 ${width} ${height}`
    );


  // START Y

  let currentY = 20;


  // DRAW TOPICS

  topicData.forEach(
    function(topic, index) {

      const y = currentY;


      // TOPIC LABEL

      svg.append("text")

        .attr(
          "class",
          "topic-label"
        )

        .attr(
          "x",
          labelWidth
        )

        .attr(
          "y",
          y + 30
        )

        .text(
          topic.topic
        );


      // COUNT

      svg.append("text")

        .attr(
          "class",
          "count-label"
        )

        .attr(
          "x",
          labelWidth + 12
        )

        .attr(
          "y",
          y + 50
        )

        .attr(
          "text-anchor",
          "start"
        )

        .text(
          `${topic.count} posters`
        );


      // POSTERS

      topic.posters.forEach(
        function(poster, posterIndex) {

          const column =
            posterIndex %
            postersPerRow;


          const posterRow =
            Math.floor(
              posterIndex /
              postersPerRow
            );


          const x =
            postersStartX +
            column *
            (imageWidth + imageGap);


          const posterY =
            y +
            posterRow *
            (imageHeight + 10);


          // IMAGE

          if (poster.image) {

            svg.append("image")

              .attr(
                "class",
                "poster-image"
              )

              .attr(
                "x",
                x
              )

              .attr(
                "y",
                posterY
              )

              .attr(
                "width",
                imageWidth
              )

              .attr(
                "height",
                imageHeight
              )

              .attr(
                "preserveAspectRatio",
                "xMidYMid slice"
              )

              .attr(
                "href",
                poster.image
              )


              // HOVER

              .on(
                "mouseenter",
                function() {

                  const tooltip =
                    d3.select(".tooltip");


                  let posterName =
                    "Untitled poster";


                  if (poster.name) {

                    if (
                      Array.isArray(
                        poster.name
                      )
                    ) {

                      posterName =
                        poster.name
                          .map(
                            function(d) {
                              return d.content;
                            }
                          )
                          .join(", ");

                    } else {

                      posterName =
                        poster.name;

                    }

                  }


                  tooltip

                    .style(
                      "opacity",
                      1
                    )

                    .html(`
                      <strong>${posterName}</strong>
                      <br>
                      Topic: ${topic.topic}
                    `);

                }
              )


              // MOVE

              .on(
                "mousemove",
                function(event) {

                  d3.select(".tooltip")

                    .style(
                      "left",
                      (event.pageX + 15) + "px"
                    )

                    .style(
                      "top",
                      (event.pageY + 15) + "px"
                    );

                }
              )


              // LEAVE

              .on(
                "mouseleave",
                function() {

                  d3.select(".tooltip")
                    .style(
                      "opacity",
                      0
                    );

                }
              );

          }


          // NO IMAGE

          else {

            svg.append("rect")

              .attr(
                "class",
                "no-image"
              )

              .attr(
                "x",
                x
              )

              .attr(
                "y",
                posterY
              )

              .attr(
                "width",
                imageWidth
              )

              .attr(
                "height",
                imageHeight
              );


            svg.append("text")

              .attr(
                "class",
                "no-image-text"
              )

              .attr(
                "x",
                x + imageWidth / 2
              )

              .attr(
                "y",
                posterY + imageHeight / 2
              )

              .text(
                "No image"
              );

          }

        }
      );


      // SEPARATOR

      svg.append("line")

        .attr(
          "x1",
          postersStartX
        )

        .attr(
          "x2",
          width
        )

        .attr(
          "y1",
          y + rowHeights[index] - 15
        )

        .attr(
          "y2",
          y + rowHeights[index] - 15
        )

        .attr(
          "stroke",
          "#d5cec2"
        )

        .attr(
          "stroke-width",
          1
        );


      currentY =
        currentY +
        rowHeights[index];

    }
  );


  // TOTAL

  svg.append("text")

    .attr(
      "x",
      width - 10
    )

    .attr(
      "y",
      height - 10
    )

    .attr(
      "text-anchor",
      "end"
    )

    .attr(
      "font-size",
      13
    )

    .attr(
      "fill",
      "#666"
    )

    .text(
      `n = ${posterDataCount(topicData)} posters`
    );

}



function posterDataCount(topicData) {

  const uniquePosters = new Set();

  for (let i = 0; i < topicData.length; i = i + 1) {

    for (
      let j = 0;
      j < topicData[i].posters.length;
      j = j + 1
    ) {

      uniquePosters.add(
        topicData[i].posters[j].id
      );

    }

  }

  return uniquePosters.size;

}
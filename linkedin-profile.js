
function readLinkedInProfileInfo() {
  var name, title, url, phone, email;
  return client
      .getUrl().then(url => url.indexOf('/in/') == -1
          ? visitMyProfile()
          : Promise.resolve([]))
      .isExisting('.contact-see-more-less')
      .then(is => is ? client.click('.contact-see-more-less') : client)
      .pause(500)
      .then(() => getAllXPath({
          name: '//*[contains(@class, "pv-top-card-section__name")]//text()',
          title: '//*[contains(@class, "pv-top-card-section__headline")]//text()',
          url: '//*[contains(@class, "ci-vanity-url")]//*[contains(@class, "pv-contact-info__contact-item")]//text()',
          phone: '//*[contains(@class, "ci-phone")]//*[contains(@class, "pv-contact-info__contact-item")]//text()',
          email: '//*[contains(@class, "ci-email")]//*[contains(@class, "pv-contact-info__contact-item")]//text()'
      }))
      .then(r => ({
          name: (typeof r.name === 'string' ? [r.name] : (r.name || [])).join('').trim(),
          title: (typeof r.title === 'string' ? [r.title] : (r.title || [])).join('').trim(),
          url: (typeof r.url === 'string' ? [r.url] : (r.url || [])).join('').trim(),
          phone: (typeof r.phone === 'string' ? [r.phone] : (r.phone || [])).join('').trim(),
          email: (typeof r.email === 'string' ? [r.email] : (r.email || [])).join('').trim()
      }));
}


function scrapeEntireLinkedInProfile(profile) {
  var contact;
  return client
      .then(() => clickSpa(profile))
      .then(() => readLinkedInProfileInfo())
      .then(r => {
          contact = r;
          return loadEntirePage();
      })
      // get extra profile info
      .then(() => {
          return getAllXPath({
              summary: '//p[contains(@class, "section__summary")]//text()',
              experience: [
                  '//*[contains(@class, "profile-section__card")]|//*[contains(@class, "profile-section__section-info-item")]',
                  ['.//text()']
              ],
              skills: [
                  '//*[contains(@class, "skill-entity--featured")]|//*[contains(@class, "skill-entity__pill")]',
                  ['.//text()']
              ],
              recommendations: [
                  '//*[contains(@class, "recommendation-entity")]',
                  ['.//text()']
              ],
              interests: [
                  '//*[contains(@class, "interest-entity")]',
                  ['.//text()']
              ]
          });
      })
      .then(r => {
          return Object.assign(r, {
              summary: r.summary.join(''),
              experience: r.experience.map(e => typeof e[0] === 'string'
                  ? e[0]
                  : e[0].join('')
                      .trim().split(/\s*\n+\s*/)),
              skills: r.skills.map(e => typeof e[0] === 'string'
                  ? e[0]
                  : e[0].join('')
                      .trim().split(/\s*\n+\s*/)),
              recommendations: r.recommendations.map(e => typeof e[0] === 'string'
                  ? e[0]
                  : e[0].join('')
                      .trim().split(/\s*\n+\s*/)),
              interests: r.interests.map(e => typeof e[0] === 'string'
                  ? e[0]
                  : e[0].join('')
                      .trim().split(/\s*\n+\s*/))
          }, contact)
      })
      .catch(e => console.log(e))
};

export default {
  async afterCreate(event: any) {
    console.log('afterCreate triggered:', event.result);
    const { result } = event;

    if (result.publishedAt) {
      try {
        const formattedDescription = result.description
          ?.replace(/\\n/g, "<br/>")
          .replace(/\n/g, "<br/>");

        await strapi.plugins['email'].services.email.send({
          to: result.user_email,
          from: process.env.EMAIL_ADDRESS,
          subject: result.event_type,
          text: result.description,
          html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
              <title>${result.event_type}</title>
              <style>
                body {
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                  margin: 0;
                  padding: 0;
                  background-color: #ffffff;
                  color: #333333;
                }

                @media (prefers-color-scheme: dark) {
                  body {
                    background-color: #121212;
                    color: #ffffff;
                  }
                  .card {
                    background-color: #1e1e1e !important;
                    color: #ffffff;
                  }
                }

                .wrapper {
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 40px 20px;
                }

                .card {
                  background-color: #f4f4f4;
                  border-radius: 12px;
                  padding: 30px;
                  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                }

                .site-title {
                  text-align: center;
                  font-size: 22px;
                  font-weight: bold;
                  color: #0056b3;
                  margin-bottom: 20px;
                }

                .event-type {
                  text-align: center;
                  font-size: 20px;
                  font-weight: 600;
                  color: #222;
                  margin-bottom: 25px;
                  text-transform: capitalize;
                }

                .content {
                  font-size: 16px;
                  line-height: 1.6;
                  color: #444;
                }

                .footer {
                  margin-top: 30px;
                  font-size: 14px;
                  color: #888;
                  text-align: center;
                }
              </style>
            </head>
            <body>
              <div class="wrapper">
                <div class="card">
                  <div class="site-title">Zayvue Commerce</div>
                  <div class="event-type">${result.event_type}</div>
                  <div class="content">
                    <p>${formattedDescription}</p>
                  </div>
                </div>
                <div class="footer">
                  Thank you for using our service.<br/>
                  © ${new Date().getFullYear()} Zayvue Commerce
                </div>
              </div>
            </body>
            </html>
          `,
        });

        console.log(`Email sent to ${result.user_email}`);
      } catch (error) {
        console.error('Error sending email:', error);
      }
    } else {
      console.log(`Draft created for ${result.user_email}, email not sent.`);
    }
  },

  async afterUpdate(event: any) {
    console.log('afterUpdate triggered:', event.result);
  },
};
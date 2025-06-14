export default {
  async afterCreate(event: any) {
    console.log('afterCreate triggered:', event.result);
    const { result } = event;
    if (result.publishedAt) {
      try {
        await strapi.plugins['email'].services.email.send({
          to: result.user_email,
          from: 'dhruvjain.gdsc@gmail.com',
          subject: result.event_type,
          text: result.description,
          html: `
            <h1>${result.event_type}</h1>
            <p>${result.description}</p>
            <footer>Thank you for using our service!</footer>
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
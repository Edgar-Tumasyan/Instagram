const { v2: cloudinary } = require('cloudinary');

const {Attachment } = require('../data/models')

module.exports = async (ctx, postId, userId, reqAttachments) => {
  const attachmentsUrl = [];
  for (const file of reqAttachments) {
    const attachment = await cloudinary.uploader.upload(file.path, {
      use_filename: true,
      folder: 'attachments',
    });

    await Attachment.create({ postId, userId, attachmentUrl: attachment.secure_url })

    attachmentsUrl.push(attachment.secure_url);
  }
  return attachmentsUrl;
};

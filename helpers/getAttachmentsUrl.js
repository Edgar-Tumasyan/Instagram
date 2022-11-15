const cloudinary = require('cloudinary').v2;

module.exports = async (postId, userId, reqAttachments) => {
  const attachments = [];

  const attachmentsUrl = [];

  for (const file of reqAttachments) {
    const attachment = await cloudinary.uploader.upload(file.path, {
      use_filename: true,
      folder: 'attachments',
    });

    attachments.push({
      postId,
      userId,
      attachmentUrl: attachment.secure_url,
    });

    attachmentsUrl.push(attachment.secure_url);
  }

  return { attachments, attachmentsUrl };
};

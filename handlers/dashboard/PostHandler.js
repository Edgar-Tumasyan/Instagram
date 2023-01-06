const fs = require('fs');
const _ = require('lodash');
const { literal } = require('sequelize');

const { SortParam, SearchParam, ExportParam, ErrorMessages } = require('../../constants');
const { Post, generateSearchQuery, Attachment } = require('../../data/models');
const { Cloudinary, Helpers } = require('../../components');

const findAll = async ctx => {
    const { limit, offset, pagination } = ctx.state.paginate;
    const { q, sortType, sortField } = ctx.query;

    const sortKey = SortParam.POST[sortField] ? SortParam.POST[sortField] : SortParam.POST.default;

    const searchCondition = !_.isEmpty(q) ? generateSearchQuery(q, SearchParam.POST) : {};

    const { rows: posts, count: total } = await Post.scope({
        method: ['postsForAdmin']
    }).findAndCountAll({
        order: [[literal(`${sortKey}`), `${sortType}`]],
        where: { ...searchCondition },
        offset,
        limit
    });

    return ctx.ok({ posts, _meta: pagination(total) });
};

const exportData = async ctx => {
    const { q, sortType, sortField } = ctx.query;
    const { limit, offset } = ctx.state.paginate;
    const { type, ids } = ctx.request.body;

    const dataType = ExportParam.TYPE.includes(type) ? type : ExportParam.TYPE[0];

    const filter = { ids };

    const sortKey = SortParam.POST[sortField] ? SortParam.POST[sortField] : SortParam.POST.default;

    const searchCondition = !_.isEmpty(q) ? generateSearchQuery(q, SearchParam.USER) : {};

    const posts = await Post.scope({ method: ['postsForAdmin', filter] }).findAll({
        order: [[literal(`${sortKey}`), `${sortType}`]],
        where: { ...searchCondition },
        raw: true,
        offset,
        limit
    });

    const normalizedData = await Helpers.ExportNormalizer.post(posts);

    const data =
        dataType === ExportParam.TYPE[0]
            ? await Helpers.ExportNormalizer.jsonToCSV(normalizedData, 'post')
            : await Helpers.ExportNormalizer.jsonToEXCEL(normalizedData, 'post');

    ctx.body = fs.createReadStream(data);

    return ctx.attachment(data);
};

const remove = async ctx => {
    const { id } = ctx.request.params;

    const post = await Post.findByPk(id);

    if (!post) {
        return ctx.notFound(ErrorMessages.NOT_FOUND_POST);
    }

    const attachments = await Attachment.findAll({ where: { postId: id } });

    if (attachments) {
        for (const attachment of attachments) {
            await Cloudinary.delete(attachment.attachmentPublicId);

            await Attachment.destroy({ where: { id: attachment.id } });
        }
    }

    await post.destroy();

    return ctx.noContent();
};

module.exports = { findAll, exportData, remove };

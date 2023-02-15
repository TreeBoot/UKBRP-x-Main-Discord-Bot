const {
    ComponentType,
    EmbedBuilder,
    SlashCommandBuilder,
    ActionRowBuilder,
    SelectMenuBuilder
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Get a list of all the commands from the bot."),
    async execute(interaction) {
        const emojis = {
            info: "📝",
            moderation: "⚙",
            general: "📈",
        };

        const directories = [
            ... new Set(interaction.client.commands.map((cmd) => cmd.folder)),
        ];

        const formatString = (str) =>
            `${str[0].toUpperCase()}${str.slice(1).toLowerCase()}`;

        const categories = directories.map((dir) => {
            const getCommands = interaction.client.commands
                .filter((cmd) => cmd.folder === dir)
                .map((cmd) => {
                    return {
                        name: cmd.data.name,
                        description: cmd.data.description || "There is no description for this command.",
                    };
                });

            return {
                directory: formatString(dir),
                commands: getCommands,
            };
        });

        const embed = new EmbedBuilder().setDescription(
            "Please choose a category n the dropdown menu."
        );

        const components = (state) => [
            new ActionRowBuilder().addComponents(
                new SelectMenuBuilder()
                    .setCustomId("help-menu")
                    .setPlaceholder("Please select a category")
                    .setDisabled(state)
                    .addOptions(
                        categories.map((cmd) => {
                            return {
                                label: cmd.directory,
                                value: cmd.directory.toLowerCase(),
                                description: `Commands from ${cmd.directory} category.`,
                                emoji: emojis[cmd.directory.toLowerCase() || null],
                            };
                        })
                    )
            ),
        ];

        const initialMessage = await interaction.reply({
            embeds: [embed],
            components: components(false),
        });

        const filter = (interaction) => interaction.user.id === interaction.member.id;

        const collector = interaction.channel.createMessageComponentCollector({
            filter,
            componentType: ComponentType.SelectMenu,
        });

        const categoryEmbed = new EmbedBuilder()
        .setTitle(`${formatString} commands`)
        .setDescription(`A list of all the commands categorized`)
        .addFields(
            categories.commands.map((cmd) => {
                return {
                    name: `\`${cmd.name}\``,
                    value: cmd.description,
                    inline: true,
                };
            })
        );

        interaction.update({embeds: [categoryEmbed]});



        collector.on("end", () => {
            initialMessage.edit({ components: components(true)});
        })
        
    },
};
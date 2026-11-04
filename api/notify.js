module.exports = async (req, res) => {
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    const { action, time } = req.body || {};

    let message;

    if (action === "yes") {
        if (
            typeof time !== "string" ||
            !/^\d{2}:\d{2}$/.test(time)
        ) {
            return res.status(400).json({
                error: "Некорректное время"
            });
        }

        const [hours, minutes] = time.split(":").map(Number);

        if (hours > 23 || minutes > 59) {
            return res.status(400).json({
                error: "Некорректное время"
            });
        }

        message = `❤️ Егор подтвердил приезд!\nВремя: ${time}`;

    } else if (action === "no") {
        message = "Егор не приедет сегодня.";

    } else {
        return res.status(400).json({
            error: "Неизвестное действие"
        });
    }

    const token = process.env.BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
        return res.status(500).json({
            error: "Настройки Telegram не заданы"
        });
    }

    try {
        const response = await fetch(
            `https://api.telegram.org/bot${token}/sendMessage`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: message
                })
            }
        );

        const result = await response.json();

        if (!result.ok) {
            return res.status(502).json({
                error: "Telegram не отправил сообщение"
            });
        }

        return res.status(200).json({
            success: true
        });

    } catch (error) {
        return res.status(500).json({
            error: "Ошибка отправки"
        });
    }
};

const crypto = require("crypto");

const generateTemporaryPassword = () => {
  const uppercase = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lowercase = "abcdefghijkmnopqrstuvwxyz";
  const numbers = "23456789";
  const symbols = "@#$%&*!";

  const allCharacters =
    uppercase +
    lowercase +
    numbers +
    symbols;

  const randomCharacter = (characters) => {
    return characters[
      crypto.randomInt(
        0,
        characters.length
      )
    ];
  };

  /*
    Guarantee at least:
    - 1 uppercase
    - 1 lowercase
    - 1 number
    - 1 symbol
  */
  const password = [
    randomCharacter(uppercase),
    randomCharacter(lowercase),
    randomCharacter(numbers),
    randomCharacter(symbols),
  ];

  while (password.length < 12) {
    password.push(
      randomCharacter(allCharacters)
    );
  }

  /*
    Cryptographically secure shuffle.
  */
  for (
    let i = password.length - 1;
    i > 0;
    i--
  ) {
    const j = crypto.randomInt(
      0,
      i + 1
    );

    [
      password[i],
      password[j],
    ] = [
      password[j],
      password[i],
    ];
  }

  return password.join("");
};

module.exports =
  generateTemporaryPassword;
import styled from 'styled-components';

const Button = () => {
  return (
    <StyledWrapper>
      <button id="bottone1"><strong>Commencer</strong></button>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  #bottone1 {
    padding-left: 33px;
    padding-right: 33px;
    padding-bottom: 16px;
    padding-top: 16px;
    border-radius: 9px;
    background: #6a1b9a; /* violet foncé */
    color: white;
    border: none;
    font-family: inherit;
    text-align: center;
    cursor: pointer;
    transition: 0.4s;
  }

  #bottone1:hover {
    box-shadow: 7px 5px 56px -14px #ab47bc; /* ombre violet plus clair */
  }

  #bottone1:active {
    transform: scale(0.97);
    box-shadow: 7px 5px 56px -10px #ab47bc;
  }
`;

export default Button;
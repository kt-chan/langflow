import { LoginType, changeUser, useMutationFunctionType } from "@/types/api";
import { UseMutationResult } from "@tanstack/react-query";
import { api } from "../../api";
import { getURL } from "../../helpers/constants";
import { UseRequestProcessor } from "../../services/request-processor";

export const useLoginUser: useMutationFunctionType<undefined, LoginType> = (
  options?,
) => {
  const { mutate } = UseRequestProcessor();

  async function loginUserFn({ password, username }: LoginType): Promise<any> {
    const res = await api.post(
      `${getURL("LOGIN")}`,
      new URLSearchParams({
        username: username,
        password: password,
      }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );
    return res.data;
  }

  const mutation: UseMutationResult<LoginType, any, LoginType> = mutate(
    ["useLoginUser"],
    loginUserFn,
    options,
  );

  return mutation;
};

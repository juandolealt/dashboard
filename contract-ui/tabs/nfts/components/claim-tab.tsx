import { FormControl, Input, Stack } from "@chakra-ui/react";
import { DropContract, useAddress, useClaimNFT } from "@thirdweb-dev/react";
import { TransactionButton } from "components/buttons/TransactionButton";
import { detectFeatures } from "components/contract-components/utils";
import { useTrack } from "hooks/analytics/useTrack";
import { useTxNotifications } from "hooks/useTxNotifications";
import { useForm } from "react-hook-form";
import { FormErrorMessage, FormHelperText, FormLabel } from "tw-components";

interface ClaimTabProps {
  contract: DropContract;
  tokenId: string;
}

export const ClaimTab: React.FC<ClaimTabProps> = ({ contract, tokenId }) => {
  const trackEvent = useTrack();
  const address = useAddress();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<{ to: string; amount: string }>({
    defaultValues: { to: address, amount: "1" },
  });

  const claim = useClaimNFT(contract);

  const { onSuccess, onError } = useTxNotifications(
    "Claim successful",
    "Error claiming NFT",
  );

  const isErc1155 = detectFeatures(contract, ["ERC1155"]);

  return (
    <Stack pt={3}>
      <form
        onSubmit={handleSubmit((data) => {
          trackEvent({
            category: "nft",
            action: "claim",
            label: "attempt",
          });
          claim.mutate(
            {
              tokenId,
              to: data.to,
              quantity: data.amount,
            },
            {
              onSuccess: () => {
                trackEvent({
                  category: "nft",
                  action: "claim",
                  label: "success",
                });
                onSuccess();
                reset();
              },
              onError: (error) => {
                trackEvent({
                  category: "nft",
                  action: "claim",
                  label: "error",
                  error,
                });
                onError(error);
              },
            },
          );
        })}
      >
        <Stack gap={3}>
          <Stack spacing={6} w="100%" direction={{ base: "column", md: "row" }}>
            <FormControl isRequired={isErc1155} isInvalid={!!errors.to}>
              <FormLabel>Amount</FormLabel>
              <Input placeholder={"1"} {...register("amount")} />
              <FormHelperText>How many would you like to claim?</FormHelperText>
              <FormErrorMessage>{errors.amount?.message}</FormErrorMessage>
            </FormControl>
          </Stack>
          <TransactionButton
            transactionCount={1}
            isLoading={claim.isLoading}
            type="submit"
            colorScheme="primary"
            alignSelf="flex-end"
          >
            Claim
          </TransactionButton>
        </Stack>
      </form>
    </Stack>
  );
};
